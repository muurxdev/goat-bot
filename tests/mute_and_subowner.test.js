// Banco de teste separado: sem isto o teste gravava no data/database.sqlite real
// (agendamentos de fechamento, usuários falsos).
process.env.NODE_ENV = 'test'
/**
 * Testes de Silenciamento (Mute Engine) e Subdonos (Aluguel do Bot)
 */

const assert = require('assert')
const muteService = require('../src/services/muteService')
const rentalService = require('../src/services/rentalService')
const rentalRepo = require('../src/database/repositories/rentalRepository')

console.log('🧪 Iniciando testes de Mute & Subdonos...')

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

const testGroup = '120363000000000000@g.us'
const testUser = '5511999990001@s.whatsapp.net'
const testUser2 = '5511999990002@s.whatsapp.net'

// 1. Teste de parse de duração de mute
test('parseMuteDuration converte unidades de tempo com precisão', () => {
    assert.strictEqual(muteService.parseMuteDuration('10m'), 10 * 60 * 1000)
    assert.strictEqual(muteService.parseMuteDuration('2h'), 2 * 60 * 60 * 1000)
    assert.strictEqual(muteService.parseMuteDuration('1d'), 24 * 60 * 60 * 1000)
    assert.strictEqual(muteService.parseMuteDuration('indefinido'), 0)
    assert.strictEqual(muteService.parseMuteDuration('0'), 0)
})

// 2. Mute e verificação ativa
test('muteUser silencia usuário e isMuted retorna true com motivo', () => {
    muteService.muteUser({
        groupJid: testGroup,
        userJid: testUser,
        mutedBy: 'AdminTest',
        durationMinutes: 30,
        reason: 'Spam de mensagens'
    })

    const status = muteService.isMuted(testGroup, testUser)
    assert.strictEqual(status.muted, true)
    assert.strictEqual(status.reason, 'Spam de mensagens')
    assert.ok(status.remainingMs > 0)
})

// 3. Listagem de membros silenciados
test('getMutedMembers lista membros mutados no grupo', () => {
    const list = muteService.getMutedMembers(testGroup)
    assert.ok(Array.isArray(list))
    const found = list.find(m => m.userJid === testUser)
    assert.ok(found, 'Usuário testUser deve estar na lista')
    assert.strictEqual(found.reason, 'Spam de mensagens')
})

// 4. Throttling de notificações
test('shouldNotifyMuted limita avisos com intervalo seguro anti-flood', () => {
    const first = muteService.shouldNotifyMuted(testGroup, testUser)
    assert.strictEqual(first, true)
    const secondImmediate = muteService.shouldNotifyMuted(testGroup, testUser)
    assert.strictEqual(secondImmediate, false)
})

// 5. Unmute de usuário específico
test('unmuteUser revoga o silenciamento', () => {
    const unmuted = muteService.unmuteUser(testGroup, testUser)
    assert.strictEqual(unmuted, true)
    const check = muteService.isMuted(testGroup, testUser)
    assert.strictEqual(check.muted, false)
})

// 6. ResetAllMutes
test('resetAllMutes remove todos os silenciamentos do grupo', () => {
    muteService.muteUser({ groupJid: testGroup, userJid: testUser, mutedBy: 'AdminTest' })
    muteService.muteUser({ groupJid: testGroup, userJid: testUser2, mutedBy: 'AdminTest' })

    const count = muteService.resetAllMutes(testGroup)
    assert.strictEqual(count >= 2, true)
    assert.strictEqual(muteService.isMuted(testGroup, testUser).muted, false)
    assert.strictEqual(muteService.isMuted(testGroup, testUser2).muted, false)
})

// 7. Subdonos (Plano de Aluguel do Bot)
test('setRental com targetType bot cria Subdono ativo com liberação de PV', () => {
    const subownerJid = '5511988880000@s.whatsapp.net'
    rentalService.setRental({
        targetJid: subownerJid,
        targetType: 'bot',
        targetName: 'Subdono Teste',
        rentedBy: 'DonoPrincipal',
        durationStr: '30d',
        price: 70
    })

    const check = rentalService.hasActiveRental(subownerJid, 'bot')
    assert.strictEqual(check.active, true)
    assert.strictEqual(check.targetType, 'bot')

    // Deve também atender o escopo de PV
    const checkPv = rentalService.hasActiveRental(subownerJid, 'pv')
    assert.strictEqual(checkPv.active, true)

    // Deve constar em getAllSubowners
    const subdonos = rentalService.getAllSubowners()
    const found = subdonos.find(s => s.targetJid === subownerJid || s.groupJid === subownerJid)
    assert.ok(found, 'Deve estar na lista oficial de subdonos')
})

console.log(`\n📊 Mute & Subdonos: ✅ ${pass}  ❌ ${fail}`)
if (fail > 0) process.exit(1)

