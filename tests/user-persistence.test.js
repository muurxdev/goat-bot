/**
 * BotXP — Testes de persistência de usuário (Fase 1)
 *
 * Cobre os bugs de perda de dado corrigidos na migração de INSERT OR REPLACE
 * para ON CONFLICT DO UPDATE:
 *  - alinhamento de placeholders (round-trip de todos os ~60 campos)
 *  - created_at não é destruído a cada save
 *  - vault_coins (gerido por outro repo) sobrevive a saveUser
 *  - guardas anti-regressão em level/xp/messages/mochila
 *  - escape hatch saveUser(user, { force: true }) permite reset
 *  - incrementCommandCount é atômico
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const { DatabaseSync } = require('node:sqlite')

// Banco de teste isolado, com o schema real via migrator.
const testDbPath = path.join(__dirname, 'test_user_persistence.sqlite')
if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath)
const db = new DatabaseSync(testDbPath)
db.exec('PRAGMA foreign_keys = ON;')
require('../src/database/migrator').runMigrations(db)

// Injeta o banco de teste na connection antes de carregar o repositório.
const connPath = require.resolve('../src/database/connection')
require.cache[connPath] = {
    id: connPath,
    exports: { getDatabase: () => db, q: (sql) => db.prepare(sql), closeDatabase: () => {} },
    loaded: true
}
const repo = require('../src/database/repositories/userRepository')

let pass = 0, fail = 0
function test(name, fn) {
    try { fn(); console.log(`  ✅ PASS: ${name}`); pass++ }
    catch (e) { console.error(`  ❌ FAIL: ${name}\n     ${e.message}`); fail++ }
}

console.log('🧪 Testes de persistência de usuário (Fase 1)...\n')

const JID = 'persist-test@s.whatsapp.net'

test('round-trip: todos os ~60 campos voltam alinhados (sem desync de placeholder)', () => {
    const u = {
        jid: JID, xp: 12345, level: 42, messages: 999, coins: 7777, rep: 11, streak: 5,
        hp: 88, hpMax: 150, mundo: 'deserto', mochila: 35, classe: 'mago', classeLendaria: 'arcano',
        bugPower: 321, pet: 'dragao', equipado: 'set1', arma: 'excalibur', guilda: 'g1',
        wins: 30, losses: 9, bossesMortos: 14, arenaPontos: 2200, arenaAtual: 7, lastDaily: 1700000000,
        weeklyXp: 500, weeklyCoins: 250, messagesGroup: 600, messagesPv: 399, commandsGroup: 120,
        commandsPv: 80, xpGroup: 8000, xpPv: 4345, pocaoAtiva: { tipo: 'forca', expira: 1800000000 },
        bank: 9999, name: 'Fulano', lastDevice: 'android', lastPingMs: 42, netType: 'wifi',
        lastSeen: 1700000001, phone: '5511999998888', lid: '123@lid',
        slots: { capacete: 'c1', peitoral: 'p1', calca: 'ca1', botas: 'b1', arma: 'a1', escudo: 'e1', amuleto: 'am1' },
        forgeLevel: 6, nicknameRpg: 'Nick', atk: 77, def: 33,
        inventario: ['pocao', 'espada'], conquistas: ['first'], pets: ['gato'],
        vaultCoins: 5000, rebirthCount: 3, grimoireSpells: ['fireball'], activeRunes: ['r1', 'r2'],
        characterRace: 'elfo', characterElement: 'gelo', fogueiraBuffExpira: 1750000000,
        pvFarmCount: 15, groupFarmCount: 22, coinsPv: 333, coinsGroup: 444
    }
    repo.saveUser(u)
    const b = repo.getUser(JID)
    assert.strictEqual(b.xp, 12345)
    assert.strictEqual(b.level, 42)
    assert.strictEqual(b.arma, 'excalibur')
    assert.strictEqual(b.atk, 77)
    assert.strictEqual(b.def, 33)
    assert.strictEqual(b.vaultCoins, 5000)
    assert.strictEqual(b.rebirthCount, 3)
    assert.strictEqual(b.characterRace, 'elfo')
    assert.strictEqual(b.characterElement, 'gelo')
    assert.strictEqual(b.coinsGroup, 444)
    assert.strictEqual(b.phone, '5511999998888')
    assert.strictEqual(b.lid, '123@lid')
    assert.strictEqual(b.slots.arma, 'a1')
    assert.deepStrictEqual(b.activeRunes, ['r1', 'r2'])
    assert.deepStrictEqual(b.inventario, ['pocao', 'espada'])
})

test('created_at não muda após 5 saves', () => {
    const c0 = db.prepare('SELECT created_at FROM users WHERE jid = ?').get(JID).created_at
    for (let i = 0; i < 5; i++) repo.saveUser({ jid: JID, xp: 12345 + i, level: 42, messages: 999 + i })
    const c1 = db.prepare('SELECT created_at FROM users WHERE jid = ?').get(JID).created_at
    assert.strictEqual(c0, c1)
})

test('vault_coins sobrevive a saveUser (gerido por vaultRepository)', () => {
    db.prepare('UPDATE users SET vault_coins = 500 WHERE jid = ?').run(JID)
    repo.saveUser({ jid: JID, xp: 20000, level: 43, messages: 1200 })
    assert.strictEqual(db.prepare('SELECT vault_coins FROM users WHERE jid = ?').get(JID).vault_coins, 500)
})

test('anti-regressão: level/messages não caem sem force', () => {
    repo.saveUser({ jid: JID, level: 40, xp: 9999, messages: 500 }, { force: true }) // baseline
    repo.saveUser({ jid: JID, level: 1, xp: 0, messages: 1 })                        // tentativa de regressão
    const r = db.prepare('SELECT level, messages FROM users WHERE jid = ?').get(JID)
    assert.strictEqual(r.level, 40)
    assert.strictEqual(r.messages, 500)
})

test('force:true permite reset de level/xp', () => {
    repo.saveUser({ jid: JID, level: 1, xp: 0, messages: 0, mochila: 20 }, { force: true })
    assert.strictEqual(db.prepare('SELECT level FROM users WHERE jid = ?').get(JID).level, 1)
})

test('incrementCommandCount é atômico (+2)', () => {
    const before = db.prepare('SELECT commands_group FROM users WHERE jid = ?').get(JID).commands_group
    repo.incrementCommandCount(JID, true)
    repo.incrementCommandCount(JID, true)
    const after = db.prepare('SELECT commands_group FROM users WHERE jid = ?').get(JID).commands_group
    assert.strictEqual(after, before + 2)
})

const JID_INV = 'persist-inv@s.whatsapp.net'

test('inventário: objeto parcial (sem o campo) preserva a mochila gravada', () => {
    repo.saveUser({ jid: JID_INV, level: 5, inventario: ['pocao_vida', 'erva'] })
    repo.saveUser({ jid: JID_INV, level: 5, coins: 10 })
    assert.deepStrictEqual(repo.getUser(JID_INV).inventario, ['pocao_vida', 'erva'])
})

test('inventário: consumir o último item grava a mochila vazia (não volta)', () => {
    const u = repo.getUser(JID_INV)
    u.inventario.splice(0, 1)
    repo.saveUser(u)
    assert.deepStrictEqual(repo.getUser(JID_INV).inventario, ['erva'])
    const u2 = repo.getUser(JID_INV)
    u2.inventario = u2.inventario.filter(i => i !== 'erva')
    repo.saveUser(u2)
    assert.deepStrictEqual(repo.getUser(JID_INV).inventario, [])
    assert.strictEqual(db.prepare('SELECT inventario FROM users WHERE jid = ?').get(JID_INV).inventario, '[]')
})

test('inventário: objeto montado do zero com mochila vazia NÃO apaga a gravada', () => {
    repo.saveUser({ jid: JID_INV, inventario: ['espada'] })
    repo.saveUser({ jid: JID_INV, inventory: [] })
    repo.saveUser({ jid: JID_INV, inventario: [] })
    assert.deepStrictEqual(repo.getUser(JID_INV).inventario, ['espada'])
})

test('inventário: alias inventory esvaziado num perfil lido do banco grava vazio', () => {
    const u = repo.getUser(JID_INV)
    u.inventory = []
    delete u.inventario
    repo.saveUser(u)
    assert.deepStrictEqual(repo.getUser(JID_INV).inventario, [])
})

test('inventário: item renomeado (Chama do Backend) vira o nome novo na leitura', () => {
    repo.saveUser({ jid: JID_INV, inventario: ['🌟 Chama do Backend', 'erva'] })
    assert.deepStrictEqual(repo.getUser(JID_INV).inventario, ['🌟 Chama do Purgatório', 'erva'])
})

const JID_SK = 'persist-skills@s.whatsapp.net'

test('skills: JSON de JSON gravado no formato antigo volta como lista e não se perde', () => {
    repo.saveUser({ jid: JID_SK, level: 30 })
    db.prepare('UPDATE users SET skills = ? WHERE jid = ?').run(JSON.stringify(JSON.stringify(['furia', 'ataque'])), JID_SK)
    const u = repo.getUser(JID_SK)
    assert.deepStrictEqual(u.skills, ['furia', 'ataque'])
    repo.saveUser(u)
    assert.strictEqual(db.prepare('SELECT skills FROM users WHERE jid = ?').get(JID_SK).skills, '["furia","ataque"]')
})

test('skills: lista simples e texto JSON no objeto gravam uma vez só', () => {
    repo.saveUser({ jid: JID_SK, skills: ['defesa'] })
    assert.strictEqual(db.prepare('SELECT skills FROM users WHERE jid = ?').get(JID_SK).skills, '["defesa"]')
    repo.saveUser({ jid: JID_SK, skills: JSON.stringify(['defesa', 'cura']) })
    assert.strictEqual(db.prepare('SELECT skills FROM users WHERE jid = ?').get(JID_SK).skills, '["defesa","cura"]')
    assert.deepStrictEqual(repo.getUser(JID_SK).skills, ['defesa', 'cura'])
})

console.log(`\n📊 Persistência: ✅ ${pass}  ❌ ${fail}`)
try { db.close() } catch (_) {}
if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath)
if (fail > 0) process.exit(1)
