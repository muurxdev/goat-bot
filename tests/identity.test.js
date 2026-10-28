/**
 * Testes da unificação de identidade (perfil único lid ↔ número).
 * Usa jids sintéticos e limpa ao final para não poluir o banco.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const { getDatabase, q } = require('../src/database/connection')
const userRepo = require('../src/database/repositories/userRepository')

const PHONE_JID = '5599000000001@s.whatsapp.net'
const LID_JID = '2000000000000001@lid'
const PHONE_DIGITS = '5599000000001'

function cleanup() {
    try {
        q('DELETE FROM users WHERE jid IN (?, ?)').run(PHONE_JID, LID_JID)
        q('DELETE FROM user_identities WHERE jid IN (?, ?)').run(PHONE_JID, LID_JID)
    } catch (_) {}
}

let pass = 0, fail = 0
function test(name, fn) {
    try { fn(); console.log('  ✅ PASS: ' + name); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + name + '\n     ' + e.message); fail++ }
}

console.log('🧪 Testes de identidade única (lid ↔ número)...\n')
getDatabase()
cleanup()

// perfil real existe sob o número, com progresso
userRepo.saveUser({ jid: PHONE_JID, xp: 500, level: 7, coins: 1234, phone: PHONE_DIGITS })

test('sem vínculo, getUser(@lid) NÃO encontra o perfil do número', () => {
    const u = userRepo.getUser(LID_JID)
    assert.ok(!u || u.jid !== PHONE_JID, 'não deveria unificar sem vínculo')
})

test('linkIdentity grava o vínculo lid → número', () => {
    userRepo.linkIdentity(LID_JID, { phoneDigits: PHONE_DIGITS, linkedJid: PHONE_JID })
    const row = q('SELECT * FROM user_identities WHERE jid = ?').get(LID_JID)
    assert.ok(row, 'linha de identidade criada')
    assert.strictEqual(row.linked_jid, PHONE_JID)
})

test('após o vínculo, getUser(@lid) resolve o perfil canônico do número', () => {
    const u = userRepo.getUser(LID_JID)
    assert.ok(u, 'perfil encontrado')
    assert.strictEqual(u.jid, PHONE_JID)
    assert.strictEqual(u.xp, 500)
    assert.strictEqual(u.coins, 1234)
})

test('saveUser ignora jids de grupo (@g.us)', () => {
    userRepo.saveUser({ jid: '123456@g.us', xp: 999 })
    const row = q('SELECT * FROM users WHERE jid = ?').get('123456@g.us')
    assert.ok(!row, 'grupo não deve virar perfil')
})

cleanup()

console.log('\n========================================')
console.log('📊 RESULTADO — Identidade única:')
console.log('   ✅ Passaram: ' + pass)
console.log('   ❌ Falharam: ' + fail)
console.log('========================================')
if (fail > 0) process.exit(1)
