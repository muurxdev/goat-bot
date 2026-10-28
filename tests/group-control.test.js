/**
 * BotXP — Group Control Service
 * Testes do fechamento/reabertura de grupos com duração ou indefinido.
 */
// Isola o banco: sem isto a suite escrevia no banco de PRODUCAO.
process.env.NODE_ENV = 'test'

const assert = require('assert')
const groupControl = require('../src/services/groupControlService')

const GROUP = '1203630000000000000@g.us'

async function run() {
    let updates = []
    const client = {
        async groupSettingUpdate(lid, setting) {
            updates.push({ lid, setting })
            return true
        }
    }

    // ---- 1. fechamento indefinido ----
    const closed = await groupControl.closeGroup(client, GROUP, { durationStr: null })
    assert.strictEqual(closed.closed, true, 'grupo deve estar fechado')
    assert.strictEqual(closed.until, null, 'sem duração = indefinido')
    assert.strictEqual(updates[0].setting, 'announcement', 'fecha via groupSettingUpdate announcement')

    // ---- 2. reabertura ----
    updates = []
    const opened = await groupControl.openGroup(client, GROUP)
    assert.strictEqual(opened.closed, false, 'grupo deve estar aberto')
    assert.strictEqual(updates[0].setting, 'not_announcement', 'abre via groupSettingUpdate not_announcement')

    // ---- 3. fechamento com duração agenda reabertura ----
    updates = []
    const timed = await groupControl.closeGroup(client, GROUP, { durationStr: '2m' })
    assert.strictEqual(timed.closed, true, 'fechado')
    assert.ok(timed.until > Date.now(), 'until deve ser futuro')
    assert.strictEqual(updates[0].setting, 'announcement', 'chamou o fechamento')

    // ---- 4. abrir durante agendamento cancela o timer de reabertura ----
    const statusBefore = groupControl.getGroupStatus(GROUP)
    assert.strictEqual(statusBefore.closed, true, 'status em memória fechado')
    assert.ok(statusBefore.until > Date.now(), 'tem reabertura agendada')
    await groupControl.openGroup(client, GROUP, { silent: true })
    const statusAfter = groupControl.getGroupStatus(GROUP)
    assert.strictEqual(statusAfter.closed, false, 'status em memória aberto após abrir')
    assert.strictEqual(statusAfter.until, null, 'agendamento cancelado')
    assert.strictEqual(statusAfter.timer, null, 'timer limpo')

    // ---- 5. status de grupo nunca tocado ----
    assert.deepStrictEqual(groupControl.getGroupStatus('1203631111111111111@g.us'), { closed: false, until: null }, 'grupo desconhecido = aberto')

    // ---- 6. duração inválida lança ----
    await assert.rejects(
        () => groupControl.closeGroup(client, GROUP, { durationStr: 'xpto' }),
        /Duração inválida|Unidade de duração inválida/,
        'duração inválida deve lançar'
    )

    // ---- 7. cliente sem groupSettingUpdate lança ----
    groupControl.clearGroupState(GROUP)
    await assert.rejects(
        () => groupControl.closeGroup({}, GROUP),
        /não vinculado/,
        'sem método deve lançar'
    )

    console.log('✅ group-control test: all assertions passed')
}

run().catch(err => {
    console.error('❌ group-control test failed:', err)
    process.exit(1)
})