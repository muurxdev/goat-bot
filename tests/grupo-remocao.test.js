/**
 * Testes de remoção de membros (.ban, .kick, .timeban, .warn, votação).
 *
 * O que precisa continuar verdadeiro:
 *  - Admin comum PODE ser removido. Só o criador do grupo é protegido.
 *  - Quando o WhatsApp recusa (status != 200 ou erro), o bot NÃO anuncia
 *    "removido" — mostra a mensagem de falha. Antes anunciava sempre.
 *  - O bot não remove a si mesmo nem remove sem ser admin.
 *  - Quem volta antes do fim do .timeban é removido de novo.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const gas = require('../src/services/groupAuthService')
const dataService = require('../src/services/dataService')
const rem = require('../src/services/groupRemovalService')

let pass = 0, fail = 0
async function test(nome, fn) {
    try { await fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

const GRUPO = '120363429142602973@g.us'
const BOT = { id: '553597379643:1@s.whatsapp.net', lid: '99999999999999:1@lid' }
const CRIADOR = '42224477798582@lid'
const ADMIN = '11111111111111@lid'
const MEMBRO = '22222222222222@lid'
const QUEM_PEDE = '33333333333333@lid'

// Configs e advertências em memória: o teste não toca o banco real.
let configs = {}
let warns = {}
dataService.getConfigsData = () => configs
dataService.saveConfigsData = async c => { configs = c }
dataService.getWarnsData = () => warns
dataService.saveWarnsData = async w => { warns = w }

function participantes({ botAdmin = true } = {}) {
    return [
        { id: '99999999999999@lid', admin: botAdmin ? 'admin' : null },
        { id: CRIADOR, admin: 'superadmin' },
        { id: ADMIN, admin: 'admin' },
        { id: MEMBRO, admin: null },
        { id: QUEM_PEDE, admin: 'admin' }
    ]
}

function clienteFalso({ status = '200', lanca = null, botAdmin = true, meta = {} } = {}) {
    const chamadas = { enviadas: [], remocoes: [] }
    const c = {
        chamadas,
        user: BOT,
        groupMetadata: async () => ({ owner: undefined, participants: participantes({ botAdmin }), ...meta }),
        sendMessage: async (jid, conteudo) => { chamadas.enviadas.push({ jid, conteudo }); return { key: { id: 'X' } } },
        groupParticipantsUpdate: async (jid, lista, acao) => {
            chamadas.remocoes.push({ lista, acao })
            if (lanca) throw lanca
            return lista.map(j => ({ jid: j, status }))
        },
        signalRepository: { lidMapping: {
            getLIDForPN: async pn => (pn === '5511988887777' ? '22222222222222@lid' : null),
            getPNForLID: async lid => (lid === MEMBRO ? '5511988887777@s.whatsapp.net' : null)
        } }
    }
    gas.attach(c)
    return c
}

function ctxDe(c, alvo, extra = {}) {
    let resposta = ''
    const ctx = {
        client: c, from: GRUPO, sender: QUEM_PEDE, args: [], quotedSender: null,
        info: { message: { extendedTextMessage: { contextInfo: { mentionedJid: alvo ? [alvo] : [] } } } },
        reply: async t => { resposta = t },
        ...extra
    }
    return { ctx, resposta: () => resposta }
}

;(async () => {
    console.log('🧪 Testes de remoção de membros...\n')
    const ban = require('../src/commands/admin/ban')
    const kick = require('../src/commands/admin/kick')

    await test('.ban remove um admin comum', async () => {
        const c = clienteFalso()
        const { ctx, resposta } = ctxDe(c, ADMIN)
        await ban.execute(ctx)
        assert.deepStrictEqual(c.chamadas.remocoes, [{ lista: [ADMIN], acao: 'remove' }])
        assert.ok(/foi removido do grupo por/.test(resposta()), resposta())
    })

    await test('.ban não remove o criador do grupo (superadmin)', async () => {
        const c = clienteFalso()
        const { ctx, resposta } = ctxDe(c, CRIADOR)
        await ban.execute(ctx)
        assert.strictEqual(c.chamadas.remocoes.length, 0)
        assert.ok(/criou este grupo/.test(resposta()), resposta())
    })

    await test('criador reconhecido por metadata.owner mesmo sem marca superadmin', async () => {
        const c = clienteFalso({ meta: { owner: ADMIN } })
        const { ctx, resposta } = ctxDe(c, ADMIN)
        await ban.execute(ctx)
        assert.strictEqual(c.chamadas.remocoes.length, 0)
        assert.ok(/criou este grupo/.test(resposta()), resposta())
    })

    await test('WhatsApp recusa (403): não anuncia remoção e avisa', async () => {
        const c = clienteFalso({ status: '403' })
        const { ctx, resposta } = ctxDe(c, ADMIN)
        await ban.execute(ctx)
        assert.strictEqual(c.chamadas.remocoes.length, 1)
        assert.ok(!/foi removido/.test(resposta()), 'não pode dizer que removeu: ' + resposta())
        assert.ok(/não me deixou remover/.test(resposta()), resposta())
    })

    await test('WhatsApp limita a taxa (429): pede pausa', async () => {
        const erro = Object.assign(new Error('rate-overlimit'), { output: { statusCode: 429 } })
        const c = clienteFalso({ lanca: erro })
        const { ctx, resposta } = ctxDe(c, MEMBRO)
        await ban.execute(ctx)
        assert.ok(/pediu uma pausa/.test(resposta()), resposta())
    })

    await test('bot sem admin não tenta remover e explica', async () => {
        const c = clienteFalso({ botAdmin: false })
        const { ctx, resposta } = ctxDe(c, MEMBRO)
        await ban.execute(ctx)
        assert.strictEqual(c.chamadas.remocoes.length, 0)
        assert.ok(/Preciso ser administrador/.test(resposta()), resposta())
    })

    await test('o bot não remove a si mesmo', async () => {
        const c = clienteFalso()
        const { ctx, resposta } = ctxDe(c, '553597379643@s.whatsapp.net')
        await ban.execute(ctx)
        assert.strictEqual(c.chamadas.remocoes.length, 0)
        assert.ok(/a mim mesmo/.test(resposta()), resposta())
    })

    await test('ninguém remove a si mesmo', async () => {
        const c = clienteFalso()
        const { ctx, resposta } = ctxDe(c, QUEM_PEDE)
        await ban.execute(ctx)
        assert.strictEqual(c.chamadas.remocoes.length, 0)
        assert.ok(/a si mesmo/.test(resposta()), resposta())
    })

    await test('.ban <número> em grupo LID remove pelo LID', async () => {
        const c = clienteFalso()
        const { ctx } = ctxDe(c, null, { args: ['5511988887777'] })
        await ban.execute(ctx)
        assert.deepStrictEqual(c.chamadas.remocoes, [{ lista: [MEMBRO], acao: 'remove' }])
    })

    await test('.kick remove admin comum e anuncia', async () => {
        const c = clienteFalso()
        const { ctx } = ctxDe(c, null, { mentioned: ADMIN })
        await kick.execute(ctx)
        assert.deepStrictEqual(c.chamadas.remocoes, [{ lista: [ADMIN], acao: 'remove' }])
        assert.ok(/foi removido do grupo por/.test(c.chamadas.enviadas[0].conteudo.text))
    })

    await test('.kick com recusa do WhatsApp não anuncia remoção', async () => {
        const c = clienteFalso({ status: '403' })
        const { ctx, resposta } = ctxDe(c, null, { mentioned: ADMIN })
        await kick.execute(ctx)
        assert.strictEqual(c.chamadas.enviadas.length, 0)
        assert.ok(/não me deixou remover/.test(resposta()), resposta())
    })

    await test('.warn no limite com recusa não zera as advertências', async () => {
        const warn = require('../src/commands/admin/warn')
        configs = { [GRUPO]: { warnLimit: 1 } }
        warns = {}
        const c = clienteFalso({ status: '403' })
        const { ctx } = ctxDe(c, null, { mentioned: ADMIN })
        await warn.execute(ctx)
        assert.strictEqual(warns[ADMIN], 1)
        const texto = c.chamadas.enviadas[0].conteudo.text
        assert.ok(!/foi removido do grupo/.test(texto), texto)
        assert.ok(/não me deixou remover/.test(texto), texto)
    })

    await test('.timeban registra e remove de novo quem volta antes do prazo', async () => {
        const timeban = require('../src/commands/admin/timeban')
        const { handleGroupParticipantsUpdate } = require('../src/handlers/groupEventsHandler')
        configs = {}
        const c = clienteFalso()
        const { ctx } = ctxDe(c, ADMIN, { args: ['@11111111111111', '2h'] })
        await timeban.execute(ctx)
        assert.strictEqual(c.chamadas.remocoes.length, 1)
        assert.strictEqual(configs[GRUPO].tempBans.length, 1)

        await handleGroupParticipantsUpdate(c, { id: GRUPO, participants: [ADMIN], action: 'add', author: QUEM_PEDE })
        assert.strictEqual(c.chamadas.remocoes.length, 2, 'deveria remover de novo')
        assert.ok(/foi removido de novo/.test(c.chamadas.enviadas.at(-1).conteudo.text))
    })

    await test('.timeban vencido é descartado e não remove', async () => {
        const { handleGroupParticipantsUpdate } = require('../src/handlers/groupEventsHandler')
        configs = { [GRUPO]: { events: false, tempBans: [{ jid: ADMIN, apiJid: ADMIN, expiresAt: Date.now() - 1000 }] } }
        const c = clienteFalso()
        await handleGroupParticipantsUpdate(c, { id: GRUPO, participants: [ADMIN], action: 'add', author: QUEM_PEDE })
        assert.strictEqual(c.chamadas.remocoes.length, 0)
        assert.strictEqual(configs[GRUPO].tempBans.length, 0)
    })

    await test('votação contra o criador nem é aberta', async () => {
        const { iniciarVotacao } = require('../src/services/voteService')
        const c = clienteFalso()
        let resposta = ''
        await iniciarVotacao({ client: c, from: GRUPO, reply: async t => { resposta = t }, alvo: CRIADOR, iniciador: QUEM_PEDE, duracaoMs: 10 })
        assert.strictEqual(c.chamadas.enviadas.length, 0)
        assert.ok(/criou este grupo/.test(resposta), resposta)
    })

    console.log('\n========================================')
    console.log(`📊 RESULTADO — Remoção: ${pass} passaram, ${fail} falharam`)
    console.log('========================================\n')
    process.exit(fail > 0 ? 1 : 0)
})()
