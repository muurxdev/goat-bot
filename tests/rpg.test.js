/**
 * BotXP — Suíte de Testes da Fase 4: Progress Engine & RPG Completo
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const { calcularDanoPlayer, calcularDanoSofrido } = require('../src/services/combatEngine')
const { verificarConquistas, achievementsCatalog } = require('../src/services/achievementEngine')
const { processarLevelUp, calcularXpNecessario, initializeUser } = require('../src/services/xpService')
const { gerarBoss, sortearRaridadeBoss, atualizarArenaPlayer } = require('../src/services/rpgService')

console.log('🧪 Iniciando suíte de testes de Progress Engine & RPG (FASE 4)...\n')

let passCount = 0
let failCount = 0

function test(name, fn) {
    try {
        fn()
        console.log(`  ✅ PASS: ${name}`)
        passCount++
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`)
        console.error(`     Erro: ${err.message}`)
        failCount++
    }
}

// ══════════════════════════════════════════
// 1. COMBAT ENGINE (DANO E MITIGAÇÃO)
// ══════════════════════════════════════════
console.log('--- 1. Combat Engine (Cálculos de Dano e Defesa) ---')

test('calcularDanoPlayer calcula dano base escalonado pelo nível', () => {
    const playerLvl1 = { level: 1 }
    const playerLvl50 = { level: 50 }

    const res1 = calcularDanoPlayer(playerLvl1)
    const res50 = calcularDanoPlayer(playerLvl50)

    assert(res1.danoFinal >= 5, 'Dano nível 1 deve ser pelo menos 5')
    assert(res50.danoFinal >= 250, 'Dano nível 50 deve ser pelo menos 250')
})

test('calcularDanoPlayer aplica bônus de equipamento ativo', () => {
    const playerNormal = { level: 10 }
    const playerEquipado = { level: 10, equipado: '⚔️ Espada de Bug' }

    // Simula múltiplas execuções para verificar incremento
    let totalNormal = 0
    let totalEquipado = 0
    for (let i = 0; i < 20; i++) {
        totalNormal += calcularDanoPlayer(playerNormal).danoFinal
        totalEquipado += calcularDanoPlayer(playerEquipado).danoFinal
    }

    assert(totalEquipado > totalNormal, 'Jogador com Espada de Bug deve causar mais dano médio')
})

test('calcularDanoPlayer aplica multiplicador de poção ativa', () => {
    const playerComPocao = {
        level: 10,
        pocaoAtiva: { tipo: 'forca', expira: Date.now() + 60000 }
    }
    const playerSemPocao = { level: 10 }

    let totalPocao = 0
    let totalSem = 0
    for (let i = 0; i < 50; i++) {
        totalPocao += calcularDanoPlayer(playerComPocao).danoFinal
        totalSem += calcularDanoPlayer(playerSemPocao).danoFinal
    }

    assert(totalPocao > totalSem, 'Poção de força ativa deve elevar o dano médio')
})

test('calcularDanoSofrido reduz dano com Armadura de Firewall e Criptografada', () => {
    const playerComArmadura = { equipado: '🛡️ Armadura de Firewall' }
    const playerSemArmadura = {}

    const resCom = calcularDanoSofrido(playerComArmadura, 50)
    const resSem = calcularDanoSofrido(playerSemArmadura, 50)

    assert.strictEqual(resCom.danoMitigado, 40)
    assert.strictEqual(resSem.danoMitigado, 50)
})

// ══════════════════════════════════════════
// 2. ACHIEVEMENT ENGINE (MOTOR DE CONQUISTAS)
// ══════════════════════════════════════════
console.log('\n--- 2. Achievement Engine (Sistema de Conquistas) ---')

test('achievementsCatalog possui catálogo completo com critérios', () => {
    assert(achievementsCatalog.length >= 8)
    const ids = achievementsCatalog.map(a => a.id)
    assert(ids.includes('primeiro_codigo'))
    assert(ids.includes('dev_junior'))
    assert(ids.includes('tech_lead'))
    assert(ids.includes('gladiador_arena'))
})

test('verificarConquistas desbloqueia conquistas e concede recompensas', () => {
    const user = {
        level: 10,
        messages: 15,
        coins: 100,
        xp: 0,
        conquistas: []
    }

    const novas = verificarConquistas(user)
    assert(novas.length >= 2, 'Deve desbloquear primeiro_codigo e dev_junior')
    assert(user.conquistas.includes('primeiro_codigo'))
    assert(user.conquistas.includes('dev_junior'))
    assert(user.coins > 100, 'Deve creditar moedas de recompensa das conquistas')
})

// ══════════════════════════════════════════
// 3. LEVEL UP ENGINE & MILESTONES
// ══════════════════════════════════════════
console.log('\n--- 3. Level Up Engine & Milestones ---')

test('processarLevelUp sobe nível com XP suficiente e concede marcos', () => {
    const xpNecessario = calcularXpNecessario(1) // 100 XP
    const user = {
        level: 1,
        xp: xpNecessario + 25,
        hpMax: 100,
        hp: 40,
        coins: 0,
        conquistas: []
    }

    const res = processarLevelUp(user)

    assert.strictEqual(res.subiu, true)
    assert.strictEqual(user.level, 2)
    assert.strictEqual(user.xp, 25, 'XP excedente deve ser preservado')
    assert.strictEqual(user.hp, user.hpMax, 'HP deve ser restaurado ao máximo após level up')
    assert(user.coins > 0, 'Deve receber moedas de bônus ao subir de nível')
})

test('processarLevelUp sincroniza HP com o máximo REAL do personagem', () => {
    // O HP máximo passou a ter FONTE ÚNICA: characterEngine.resolveHp (nível +
    // equipamento + forja + raça × rebirth) — a mesma que as telas usam. Antes o
    // xpService mantinha um máximo próprio e a exibição saía descompassada.
    const { resolveHp } = require('../src/services/characterEngine')
    const user = {
        level: 4,
        xp: calcularXpNecessario(4),
        hpMax: 100,
        hp: 50,
        coins: 0,
        conquistas: []
    }
    const antes = resolveHp({ ...user, level: 4 }).max

    processarLevelUp(user)

    assert.strictEqual(user.level, 5)
    const esperado = resolveHp(user).max
    assert.strictEqual(user.hpMax, esperado, 'hpMax deve casar com o máximo real do personagem')
    assert.strictEqual(user.hp, user.hpMax, 'Vida atual deve ser restaurada ao máximo')
    assert.ok(user.hpMax > antes, 'HP máximo deve crescer ao subir de nível')
})

// ══════════════════════════════════════════
// 4. ARENA LADDER & PROGRESSÃO
// ══════════════════════════════════════════
console.log('\n--- 4. Arena Ladder & Progressão ---')

test('atualizarArenaPlayer avança arena de acordo com pontuação de troféus', () => {
    const user = { arenaPontos: 0, arenaAtual: 1 }

    atualizarArenaPlayer(user)
    assert.strictEqual(user.arenaAtual, 1)

    user.arenaPontos = 550
    atualizarArenaPlayer(user)
    assert.strictEqual(user.arenaAtual, 4, 'Com 550 troféus deve estar na Arena 4')

    user.arenaPontos = 18000
    atualizarArenaPlayer(user)
    assert.strictEqual(user.arenaAtual, 20, 'Com 18000 troféus deve alcançar a Arena 20')
})

// ══════════════════════════════════════════
// RESUMO FINAL
// ══════════════════════════════════════════
console.log('\n========================================')
console.log(`📊 RESULTADO DOS TESTES DE RPG & PROGRESSÃO:`)
console.log(`   ✅ Passaram: ${passCount}`)
console.log(`   ❌ Falharam: ${failCount}`)
console.log('========================================\n')

if (failCount > 0) process.exit(1)
else process.exit(0)

