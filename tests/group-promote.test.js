/**
 * BotXP — Testes do comando .adm unificado
 * Garante que o .adm resolve o alvo para o namespace do grupo (LID),
 * promove membros comuns e rebaixa administradores existentes.
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const admModule = require('../src/commands/admin/adm')
const groupAuth = require('../src/services/groupAuthService')

const GROUP = '1203630000000000000@g.us'
const BOT_JID = '639121522409:10@s.whatsapp.net'
const BOT_LID = '204741234567@lid'
const MUMU_LID = '42224477798582@lid'
const MARTY_LID = '22209997320394@lid'

async function run() {
    const updates = []
    let lastReply = ''

    const client = {
        user: { id: BOT_JID, lid: BOT_LID },
        signalRepository: {
            lidMapping: {
                async getPNForLID(lid) {
                    if (lid === MUMU_LID) return '5511999997777:0@s.whatsapp.net'
                    if (lid === MARTY_LID) return '5511999999999:0@s.whatsapp.net'
                    return null
                },
                async getLIDForPN() { return null }
            }
        },
        async groupMetadata(jid) {
            assert.strictEqual(jid, GROUP)
            return {
                id: GROUP,
                subject: 'Teste',
                participants: [
                    { id: MARTY_LID },
                    { id: MUMU_LID, admin: 'admin' },
                    { id: BOT_LID, admin: 'superadmin' }
                ]
            }
        },
        async groupParticipantsUpdate(jid, ids, action) {
            updates.push({ jid, ids, action })
            return [{ status: 200 }]
        }
    }

    groupAuth.attach(client)
    const adm = admModule
    assert.ok(adm, 'comando .adm carregado')
    assert.strictEqual(adm.name, 'adm')

    // 1. Promove participante comum
    await adm.execute({
        info: { message: { extendedTextMessage: { contextInfo: { mentionedJid: [MARTY_LID] } } } },
        from: GROUP,
        sender: MUMU_LID,
        args: [],
        client,
        reply: (text) => { lastReply = text }
    })

    assert.strictEqual(updates.length, 1, 'deve chamar groupParticipantsUpdate exatamente 1x')
    assert.strictEqual(updates[0].action, 'promote')
    assert.deepStrictEqual(updates[0].ids, [MARTY_LID], 'deve promover o LID do participante')
    assert.ok(/ADMIN PROMOVIDO/.test(lastReply), `reply de sucesso esperado, veio: ${lastReply}`)

    // 2. Rebaixa participante que já é admin
    updates.length = 0
    lastReply = ''
    client.groupMetadata = async () => ({
        id: GROUP,
        subject: 'Teste',
        participants: [
            { id: MARTY_LID, admin: 'admin' },
            { id: MUMU_LID, admin: 'admin' },
            { id: BOT_LID, admin: 'superadmin' }
        ]
    })

    await adm.execute({
        info: { message: { extendedTextMessage: { contextInfo: { mentionedJid: [MARTY_LID] } } } },
        from: GROUP,
        sender: MUMU_LID,
        args: [],
        client,
        reply: (text) => { lastReply = text }
    })

    assert.strictEqual(updates.length, 1, 'deve chamar a API para rebaixar')
    assert.strictEqual(updates[0].action, 'demote')
    assert.ok(/ADMIN REBAIXADO/.test(lastReply), `reply de rebaixamento esperado, veio: ${lastReply}`)

    console.log('✅ group-adm test: all assertions passed')
}

run().catch(err => {
    console.error('❌ group-adm test failed:', err)
    process.exit(1)
})