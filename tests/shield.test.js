// Banco de teste separado: sem isto o teste gravava no data/database.sqlite real
// (agendamentos de fechamento, usuários falsos).
process.env.NODE_ENV = 'test'
/**
 * Testes do Dynamic Shield Engine & Destruição de Escudo
 */

const assert = require('assert')
const shieldEngine = require('../src/services/shieldEngine')

console.log('🧪 Iniciando testes do Shield Engine...')

let pass = 0, fail = 0
function test(name, fn) {
    try {
        fn()
        console.log(`  ✅ PASS: ${name}`)
        pass++
    } catch (e) {
        console.error(`  ❌ FAIL: ${name}\n     ${e.message}`)
        fail++
    }
}

test('Catálogo de tiers de Saga Épica possui 10 patamares balanceados', () => {
    const tiers = Object.values(shieldEngine.SHIELD_TIERS)
    assert.strictEqual(tiers.length, 10)
    assert.strictEqual(shieldEngine.SHIELD_TIERS[1].name, 'Escudo de Madeira Reforçado')
    assert.strictEqual(shieldEngine.SHIELD_TIERS[10].name, 'Escudo Absoluto do Rei Arthur')
})

test('Cálculo de custo proporcional à carteira (30% a 50%)', () => {
    const tier1 = shieldEngine.SHIELD_TIERS[1]
    const cost24h = shieldEngine.calculateShieldCost(10000, tier1, '24h')
    // 30% of 10000 = 3000, baseCost is 500 => max(500, 3000) = 3000
    assert.strictEqual(cost24h, 3000)

    const tier10 = shieldEngine.SHIELD_TIERS[10]
    const cost30d = shieldEngine.calculateShieldCost(100000000, tier10, '30d')
    // 50% of 100M = 50M
    assert.strictEqual(cost30d, 50000000)
})

test('Barra de HP renderizada graficamente', () => {
    const fullBar = shieldEngine.renderHpBar(100, 100, 10)
    assert.strictEqual(fullBar, '██████████')

    const midBar = shieldEngine.renderHpBar(50, 100, 10)
    assert.strictEqual(midBar, '█████░░░░░')

    const zeroBar = shieldEngine.renderHpBar(0, 100, 10)
    assert.strictEqual(zeroBar, '░░░░░░░░░░')
})

test('Compra de escudo com saldo suficiente debita moedas e configura dynamicShield', () => {
    const mockUser = {
        level: 5,
        coins: 10000,
        jid: '5516997110418@s.whatsapp.net'
    }
    const buyRes = shieldEngine.buyShield(mockUser, 2, '24h')
    assert.strictEqual(buyRes.ok, true)
    assert.ok(mockUser.dynamicShield)
    assert.strictEqual(mockUser.dynamicShield.tier, 2)
    assert.strictEqual(mockUser.dynamicShield.hp, 2000)
    assert.strictEqual(mockUser.dynamicShield.maxHp, 2000)
    assert.ok(mockUser.coins < 10000)
})

test('Absorção de dano com vida restante reduz HP do escudo', () => {
    const mockUser = {
        coins: 50000,
        dynamicShield: {
            tier: 3,
            name: 'Broquel de Aço Temperado',
            emoji: '⚔️',
            hp: 4500,
            maxHp: 4500,
            absorcao: 65,
            expiresAt: Date.now() + 3600000,
            cooldownUntil: 0
        }
    }
    // Incoming damage: 1000. 65% absorbed = 650. Residual: 350. HP remaining: 4500 - 650 = 3850.
    const result = shieldEngine.processDamageAbsorption(mockUser, 1000)
    assert.strictEqual(result.absorbed, true)
    assert.strictEqual(result.absorbedDamage, 650)
    assert.strictEqual(result.residualDamage, 350)
    assert.strictEqual(result.broken, false)
    assert.strictEqual(mockUser.dynamicShield.hp, 3850)
})

test('Estilhaçamento de escudo por dano excessivo e aplicação de cooldown de quebra', () => {
    const mockUser = {
        coins: 50000,
        jid: '5516997110418@s.whatsapp.net',
        dynamicShield: {
            tier: 1,
            name: 'Escudo de Madeira Reforçado',
            emoji: '🪵',
            hp: 200,
            maxHp: 800,
            absorcao: 45,
            expiresAt: Date.now() + 3600000,
            cooldownUntil: 0
        }
    }
    // Incoming damage: 1000. 45% = 450 >= 200 hp => breaks! Absorbs 200.
    const result = shieldEngine.processDamageAbsorption(mockUser, 1000)
    assert.strictEqual(result.absorbed, true)
    assert.strictEqual(result.broken, true)
    assert.strictEqual(result.absorbedDamage, 200)
    assert.strictEqual(mockUser.dynamicShield.hp, 0)
    assert.ok(mockUser.dynamicShield.cooldownUntil > Date.now(), 'Deve aplicar cooldown de quebra')
})

test('Bloqueio de compra durante cooldown de quebra (shattered penalty)', () => {
    const mockUser = {
        level: 10,
        coins: 50000,
        dynamicShield: {
            tier: 1,
            hp: 0,
            maxHp: 800,
            cooldownUntil: Date.now() + 60000
        }
    }
    const check = shieldEngine.getShieldStatus(mockUser)
    assert.strictEqual(check.inCooldown, true)
    assert.strictEqual(check.active, false)

    const buyAttempt = shieldEngine.buyShield(mockUser, 1, '24h')
    assert.strictEqual(buyAttempt.ok, false)
    assert.ok(buyAttempt.error.includes('Estilhaçado'))
})

console.log(`\n📊 Shield Engine: ✅ ${pass}  ❌ ${fail}`)
if (fail > 0) process.exit(1)

