/**
 * tests/rpg-expanded.test.js
 * Testes unitários e de integração das novas engines da Fase 3 de RPG:
 * Clãs e Territórios, Árvores de Talentos, Forja/Alquimia, Raids e Montarias.
 */

process.env.NODE_ENV = 'test'
process.env.STRICT_COMMANDS = '1'

const assert = require('assert')
const clanService = require('../src/services/clanService')
const talentService = require('../src/services/talentService')
const craftService = require('../src/services/craftService')
const raidService = require('../src/services/raidService')
const mountService = require('../src/services/mountService')
const dataService = require('../src/services/dataService')

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

console.log('🧪 Testando Engines Expandidas de RPG (Fase 3)...\n')

const testUser = `551198888${Date.now()}@s.whatsapp.net`
const user = dataService.initializeUser(testUser)
user.coins = 500000
user.level = 25
dataService.saveUser(user)

// 1. Clãs e Territórios
console.log('--- 1. Clãs & Guerras Territoriais ---')
test('createClan funda clã com cofre e liderança', () => {
    const clanName = `Guardioes-${Date.now()}`
    const res = clanService.createClan(testUser, clanName)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.clanName, clanName)

    const clan = clanService.getUserClan(testUser)
    assert.ok(clan)
    assert.strictEqual(clan.isOwner, true)
})

test('donateToVault adiciona moedas e XP ao clã', () => {
    const res = clanService.donateToVault(testUser, 15000)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.donated, 15000)
    assert.ok(res.newVaultCoins >= 15000)
})

test('captureTerritory conquista território para o clã', () => {
    const res = clanService.captureTerritory(testUser, 'torre_coliseu')
    assert.strictEqual(res.success, true)
    assert.ok(res.bonusXp > 0)

    const buff = clanService.getClanTerritoryBuff(testUser)
    assert.ok(buff.territoriesCount > 0)
})

// 2. Árvores de Talentos
console.log('\n--- 2. Árvores de Talentos & Classes ---')
test('getTalents carrega árvore padrão e pontos iniciais', () => {
    const t = talentService.getTalents(testUser)
    assert.ok(t)
    assert.ok(t.talent_points >= 5)
})

test('allocatePoint gasta ponto e fortalece habilidade', () => {
    const res = talentService.allocatePoint(testUser, 'golpe_pesado')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.newLevel, 1)

    const mods = talentService.getCombatModifiers(testUser)
    assert.ok(mods.atkBonus > 0)
})

test('resetTalents devolve pontos gastos', () => {
    const res = talentService.resetTalents(testUser)
    assert.strictEqual(res.success, true)
    assert.ok(res.refundedPoints >= 5)
})

// 3. Forja & Alquimia
console.log('\n--- 3. Forja Lendária & Alquimia ---')
test('getAllRecipes lista catálogo de receitas', () => {
    const list = craftService.getAllRecipes()
    assert.ok(list.length >= 8)
})

test('craftItem forja equipamento e adiciona à mochila', () => {
    const res = craftService.craftItem(testUser, 'forja_espada_central')
    assert.strictEqual(res.success, true)
    assert.ok(res.resultItem.includes('Espada'))
})

// 4. Raids Comunitárias
console.log('\n--- 4. Raids Comunitárias de Grupo ---')
const testGroup = `1203630099${Date.now()}@g.us`
test('startRaid inicia batalha com chefe em grupo', () => {
    const res = raidService.startRaid(testGroup, 'albion')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.boss.id, 'albion')

    const active = raidService.getActiveRaid(testGroup)
    assert.ok(active)
    assert.strictEqual(active.status, 'ACTIVE')
})

test('attackRaid desfere golpe com turno e mecânica de fase', () => {
    const res = raidService.attackRaid(testGroup, testUser)
    assert.ok(res.damage > 0)
    assert.ok(res.remainingHp !== undefined)
})

// 5. Montarias
console.log('\n--- 5. Estábulo de Montarias ---')
test('adoptMount adota e equipa montaria', () => {
    const res = mountService.adoptMount(testUser, 'guardiao_porco')
    assert.strictEqual(res.success, true)

    const mounts = mountService.getUserMounts(testUser)
    assert.ok(mounts.length > 0)
    assert.strictEqual(mounts[0].mount_id, 'guardiao_porco')
    assert.strictEqual(mounts[0].equipped, 1)
})

test('feedMount recupera energia e evolui nível', () => {
    const { getDatabase } = require('../src/database/connection')
    const mounts = mountService.getUserMounts(testUser)
    getDatabase().prepare('UPDATE user_mounts SET stamina = 50 WHERE id = ?').run(mounts[0].id)

    const res = mountService.feedMount(testUser, mounts[0].id)
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.newLevel, 2)
})

console.log(`\n========================================`)
console.log(`📊 RESULTADO FASE 3: ✅ ${pass}  ❌ ${fail}`)
console.log(`========================================`)

if (fail > 0) process.exit(1)
