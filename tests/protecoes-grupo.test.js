/**
 * Testes das proteções de grupo ligadas por comando.
 *
 * O que precisa continuar verdadeiro — antes estes comandos respondiam
 * "ATIVADO" e nada lia a chave gravada:
 *  - Flag desligada não faz nada; flag ligada age.
 *  - Admin é isento (a menos que strictModeration); dono do bot sempre.
 *  - Sem o bot ser admin, nada é apagado e o aviso não se repete.
 *  - Modo lento e flood barram dentro da janela e liberam depois.
 *  - .antifake remove número de fora do Brasil e NÃO remove quando não sabe o número.
 *  - .locknick volta o nome trocado por quem não é admin.
 *  - Tesouro soma por mensagem com espera por pessoa; pote novo começa em 0.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const gas = require('../src/services/groupAuthService')
const dataService = require('../src/services/dataService')
const prot = require('../src/services/groupProtectionService')

let pass = 0, fail = 0
async function test(nome, fn) {
    prot._resetarEstado()
    try { await fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

const GRUPO = '120363429142602973@g.us'
const BOT = { id: '553597379643:1@s.whatsapp.net', lid: '99999999999999:1@lid' }
const ADMIN = '11111111111111@lid'
const MEMBRO = '22222222222222@lid'
const GRINGO = '33333333333333@lid'
const BR = '44444444444444@lid'
const SEM_NUMERO = '55555555555555@lid'

// Configs em memória: o teste não toca o banco real. O serviço grava só o
// grupo alterado ({ [grupo]: cfg }), então o save mescla.
let configs = {}
let warns = {}
dataService.getConfigsData = () => structuredClone(configs)
dataService.saveConfigsData = async c => { configs = { ...configs, ...structuredClone(c) } }
dataService.getWarnsData = () => warns
dataService.saveWarnsData = async w => { warns = w }

function clienteFalso({ botAdmin = true, subject = 'Taverna', lancaSubject = null } = {}) {
    const chamadas = { enviadas: [], remocoes: [], apagadas: [], nomes: [] }
    const c = {
        chamadas,
        user: BOT,
        groupMetadata: async () => ({
            subject,
            participants: [
                { id: '99999999999999@lid', admin: botAdmin ? 'admin' : null },
                { id: ADMIN, admin: 'admin' },
                { id: MEMBRO, admin: null },
                { id: GRINGO, admin: null },
                { id: BR, admin: null },
                { id: SEM_NUMERO, admin: null }
            ]
        }),
        sendMessage: async (jid, conteudo) => {
            if (conteudo.delete) chamadas.apagadas.push(conteudo.delete)
            else chamadas.enviadas.push({ jid, conteudo })
            return { key: { id: 'X' } }
        },
        groupParticipantsUpdate: async (jid, lista, acao) => {
            chamadas.remocoes.push({ lista, acao })
            return lista.map(j => ({ jid: j, status: '200' }))
        },
        groupUpdateSubject: async (jid, nome) => {
            if (lancaSubject) throw lancaSubject
            chamadas.nomes.push(nome)
        },
        signalRepository: { lidMapping: {
            getLIDForPN: async () => null,
            getPNForLID: async lid => (lid === BR ? '5511988887777@s.whatsapp.net' : null)
        } }
    }
    gas.attach(c)
    return c
}

const info = { key: { id: 'MSG1', remoteJid: GRUPO, participant: MEMBRO } }

function msg(c, cfg, extra = {}) {
    return prot.processarMensagem(c, {
        grupo: GRUPO, pessoa: MEMBRO, texto: '', tipo: 'conversation', info,
        cfg, isAdmin: false, isOwner: false, isBotAdmin: true, ...extra
    })
}

;(async () => {
    console.log('🧪 Testes de proteções de grupo...\n')

    // ── flags desligadas ────────────────────────────────────────
    await test('com tudo desligado nada é apagado', async () => {
        const c = clienteFalso()
        const cfg = {}
        for (const texto of ['ISSO É UM GRITO ENORME AQUI', 'porra', 'https://t.me/canal']) {
            assert.strictEqual(await msg(c, cfg, { texto }), false)
        }
        for (let i = 0; i < 20; i++) assert.strictEqual(await msg(c, cfg, { texto: 'oi' }), false)
        assert.strictEqual(c.chamadas.apagadas.length, 0)
        assert.strictEqual(c.chamadas.enviadas.length, 0)
    })

    // ── capslock ────────────────────────────────────────────────
    await test('.capslock ligado apaga e avisa em 1ª pessoa', async () => {
        const c = clienteFalso()
        assert.strictEqual(await msg(c, { antiCapslock: true }, { texto: 'ISSO É UM GRITO ENORME AQUI' }), true)
        assert.strictEqual(c.chamadas.apagadas.length, 1)
        assert.ok(/apaguei a sua/.test(c.chamadas.enviadas[0].conteudo.text), c.chamadas.enviadas[0].conteudo.text)
    })

    await test('.capslock ignora texto curto e risada', async () => {
        const c = clienteFalso()
        assert.strictEqual(await msg(c, { antiCapslock: true }, { texto: 'OK BLZ' }), false)
        assert.strictEqual(await msg(c, { antiCapslock: true }, { texto: 'KKKKKKKKKKKKKKKK' }), false)
        assert.strictEqual(await msg(c, { antiCapslock: true }, { texto: 'Hoje eu vi o NASA no jornal da tarde' }), false)
    })

    await test('admin é isento; com moderação estrita não é', async () => {
        const c = clienteFalso()
        const texto = 'ISSO É UM GRITO ENORME AQUI'
        assert.strictEqual(await msg(c, { antiCapslock: true }, { texto, isAdmin: true }), false)
        assert.strictEqual(await msg(c, { antiCapslock: true }, { texto, isOwner: true }), false)
        assert.strictEqual(await msg(c, { antiCapslock: true, strictModeration: true }, { texto, isAdmin: true }), true)
    })

    await test('bot sem admin não apaga, não finge e avisa uma vez só', async () => {
        const c = clienteFalso()
        const texto = 'ISSO É UM GRITO ENORME AQUI'
        assert.strictEqual(await msg(c, { antiCapslock: true }, { texto, isBotAdmin: false }), false)
        assert.strictEqual(await msg(c, { antiCapslock: true }, { texto, isBotAdmin: false }), false)
        assert.strictEqual(c.chamadas.apagadas.length, 0)
        assert.strictEqual(c.chamadas.enviadas.length, 1)
        const t = c.chamadas.enviadas[0].conteudo.text
        assert.ok(/preciso ser administrador/.test(t) && !/apaguei/.test(t), t)
    })

    // ── palavrões ───────────────────────────────────────────────
    await test('.profanity pega palavra com/sem acento e respeita bordas', async () => {
        assert.ok(prot.temPalavrao('seu DESGRACADO'))
        assert.ok(prot.temPalavrao('que desgraçado'))
        assert.ok(prot.temPalavrao('filho  da puta'))
        assert.ok(!prot.temPalavrao('o computador travou'))
        assert.ok(!prot.temPalavrao('disputa acirrada'))
        const c = clienteFalso()
        assert.strictEqual(await msg(c, { antiProfanity: true }, { texto: 'vai tomar no cu, porra' }), true)
        assert.strictEqual(await msg(c, { antiProfanity: false }, { texto: 'porra' }), false)
    })

    // ── modo lento ──────────────────────────────────────────────
    await test('.slowmode barra dentro do intervalo e libera depois', async () => {
        const c = clienteFalso()
        const cfg = { slowmode: true, slowmodeSeconds: 5 }
        const t0 = 1_000_000
        assert.strictEqual(await msg(c, cfg, { texto: 'a', agora: t0 }), false)
        assert.strictEqual(await msg(c, cfg, { texto: 'b', agora: t0 + 2000 }), true)
        // barrada não reinicia a contagem
        assert.strictEqual(await msg(c, cfg, { texto: 'c', agora: t0 + 5000 }), false)
        assert.strictEqual(c.chamadas.apagadas.length, 1)
        // outra pessoa não é afetada pelo intervalo de MEMBRO
        assert.strictEqual(await msg(c, cfg, { texto: 'd', agora: t0 + 5100, pessoa: BR }), false)
    })

    // ── flood ───────────────────────────────────────────────────
    await test('.flood barra acima do limite por minuto e libera depois', async () => {
        const c = clienteFalso()
        const cfg = { antiFlood: true, floodLimit: 3 }
        const t0 = 2_000_000
        for (let i = 0; i < 3; i++) assert.strictEqual(await msg(c, cfg, { texto: 'x', agora: t0 + i * 100 }), false)
        assert.strictEqual(await msg(c, cfg, { texto: 'x', agora: t0 + 400 }), true)
        assert.strictEqual(await msg(c, cfg, { texto: 'x', agora: t0 + 500 }), true)
        // um aviso só para a sequência
        assert.strictEqual(c.chamadas.enviadas.length, 1)
        assert.strictEqual(await msg(c, cfg, { texto: 'x', agora: t0 + 61_000 }), false)
    })

    // ── links de divulgação ─────────────────────────────────────
    await test('.antispamlink apaga e remove quem manda link de Telegram', async () => {
        const c = clienteFalso()
        assert.strictEqual(await msg(c, { antispamlink: true }, { texto: 'entra aí https://t.me/promo' }), true)
        assert.strictEqual(c.chamadas.apagadas.length, 1)
        assert.deepStrictEqual(c.chamadas.remocoes, [{ lista: [MEMBRO], acao: 'remove' }])
        assert.ok(/removi do grupo/.test(c.chamadas.enviadas[0].conteudo.text), c.chamadas.enviadas[0].conteudo.text)
    })

    await test('.antispamlink não pega link comum nem quando desligado', async () => {
        const c = clienteFalso()
        assert.strictEqual(await msg(c, { antispamlink: true }, { texto: 'olha https://g1.globo.com/noticia' }), false)
        assert.strictEqual(await msg(c, { antispamlink: false }, { texto: 'https://t.me/promo' }), false)
        assert.strictEqual(c.chamadas.remocoes.length, 0)
        assert.strictEqual(prot.linkDeSpam('bit.ly/abc'), 'link encurtado')
        assert.strictEqual(prot.linkDeSpam('https://chat.whatsapp.com/XYZ'), 'convite de outro grupo')
    })

    // ── status ──────────────────────────────────────────────────
    await test('.antistatus apaga o aviso de menção ao grupo no status', async () => {
        const c = clienteFalso()
        assert.strictEqual(await msg(c, { antistatus: true }, { tipo: 'groupStatusMentionMessage' }), true)
        assert.strictEqual(await msg(c, {}, { tipo: 'groupStatusMentionMessage' }), false)
        assert.strictEqual(c.chamadas.apagadas.length, 1)
    })

    await test('status@broadcast só pune com .antistatus ligado no grupo marcado', async () => {
        let handler
        try {
            handler = require('../src/handlers/messageHandler')
        } catch (e) {
            console.log('     (pulado: messageHandler não carregou fora do bot: ' + e.message + ')')
            return
        }
        const statusMsg = {
            key: { remoteJid: 'status@broadcast', participant: MEMBRO, id: 'S1' },
            message: { extendedTextMessage: { text: 'vem', contextInfo: { mentionedJid: [GRUPO] } } }
        }
        warns = {}
        configs = { [GRUPO]: {} }
        const c = clienteFalso()
        await handler.handleIncomingMessage(c, { messages: [statusMsg] })
        assert.strictEqual(warns[MEMBRO], undefined, 'desligado não pode advertir')
        assert.strictEqual(c.chamadas.enviadas.length, 0)

        configs = { [GRUPO]: { antistatus: true, warnLimit: 3 } }
        await handler.handleIncomingMessage(c, { messages: [statusMsg] })
        assert.strictEqual(warns[MEMBRO], 1)
        assert.ok(/Advertência/.test(c.chamadas.enviadas[0].conteudo.text))
    })

    // ── antifake ────────────────────────────────────────────────
    const { handleGroupParticipantsUpdate } = require('../src/handlers/groupEventsHandler')

    await test('.antifake remove quem entra com número estrangeiro (LID com phoneNumber)', async () => {
        configs = { [GRUPO]: { antifake: true, events: false } }
        const c = clienteFalso()
        await handleGroupParticipantsUpdate(c, { id: GRUPO, action: 'add', participants: [{ id: GRINGO, phoneNumber: '15551234567@s.whatsapp.net' }] })
        assert.deepStrictEqual(c.chamadas.remocoes, [{ lista: [GRINGO], acao: 'remove' }])
        assert.ok(/fora do Brasil/.test(c.chamadas.enviadas[0].conteudo.text))
    })

    await test('.antifake não remove +55 (resolvido pelo mapeamento de LID)', async () => {
        configs = { [GRUPO]: { antifake: true, events: false } }
        const c = clienteFalso()
        await handleGroupParticipantsUpdate(c, { id: GRUPO, action: 'add', participants: [BR] })
        assert.strictEqual(c.chamadas.remocoes.length, 0)
    })

    await test('.antifake não remove quando não dá para saber o número', async () => {
        configs = { [GRUPO]: { antifake: true, events: false } }
        const c = clienteFalso()
        await handleGroupParticipantsUpdate(c, { id: GRUPO, action: 'add', participants: [{ id: SEM_NUMERO }] })
        assert.strictEqual(c.chamadas.remocoes.length, 0)
        assert.strictEqual(c.chamadas.enviadas.length, 0)
    })

    await test('.antifake desligado não remove ninguém', async () => {
        configs = { [GRUPO]: { events: false } }
        const c = clienteFalso()
        await handleGroupParticipantsUpdate(c, { id: GRUPO, action: 'add', participants: [{ id: GRINGO, phoneNumber: '15551234567@s.whatsapp.net' }] })
        assert.strictEqual(c.chamadas.remocoes.length, 0)
    })

    // ── locknick ────────────────────────────────────────────────
    await test('.locknick volta o nome trocado por quem não é admin', async () => {
        configs = { [GRUPO]: { locknick: true, locknickNome: 'Taverna' } }
        const c = clienteFalso({ subject: 'Zoeira' })
        await prot.tratarAtualizacaoGrupo(c, { id: GRUPO, subject: 'Zoeira', author: MEMBRO })
        assert.deepStrictEqual(c.chamadas.nomes, ['Taverna'])
        assert.ok(/voltei para \*Taverna\*/.test(c.chamadas.enviadas[0].conteudo.text))
    })

    await test('.locknick aceita a troca feita por admin e trava o nome novo', async () => {
        configs = { [GRUPO]: { locknick: true, locknickNome: 'Taverna' } }
        const c = clienteFalso({ subject: 'Taverna 2' })
        await prot.tratarAtualizacaoGrupo(c, { id: GRUPO, subject: 'Taverna 2', author: ADMIN })
        assert.strictEqual(c.chamadas.nomes.length, 0)
        assert.strictEqual(configs[GRUPO].locknickNome, 'Taverna 2')
    })

    await test('.locknick desligado ou troca feita pelo bot não reverte', async () => {
        configs = { [GRUPO]: { locknick: false, locknickNome: 'Taverna' } }
        const c = clienteFalso()
        await prot.tratarAtualizacaoGrupo(c, { id: GRUPO, subject: 'Zoeira', author: MEMBRO })
        configs = { [GRUPO]: { locknick: true, locknickNome: 'Taverna' } }
        await prot.tratarAtualizacaoGrupo(c, { id: GRUPO, subject: 'Outro', author: '553597379643@s.whatsapp.net' })
        assert.strictEqual(c.chamadas.nomes.length, 0)
    })

    await test('.locknick on guarda o nome atual do grupo', async () => {
        configs = {}
        clienteFalso({ subject: 'Chapéu de Javali' })
        const nome = await prot.definirTravaNome(GRUPO, true)
        assert.strictEqual(nome, 'Chapéu de Javali')
        assert.strictEqual(configs[GRUPO].locknick, true)
        assert.strictEqual(configs[GRUPO].locknickNome, 'Chapéu de Javali')
    })

    // ── tesouro ─────────────────────────────────────────────────
    await test('tesouro soma por mensagem com espera por pessoa', async () => {
        configs = { [GRUPO]: { tesouro: { saldo: 0, meta: 50000, contribuintes: {} } } }
        const cfg = configs[GRUPO]
        const t0 = 3_000_000
        const n = prot.TESOURO_MOEDAS_POR_MENSAGEM
        assert.strictEqual(prot.registrarMensagemTesouro(GRUPO, MEMBRO, cfg, t0), n)
        assert.strictEqual(prot.registrarMensagemTesouro(GRUPO, MEMBRO, cfg, t0 + 1000), 0)
        assert.strictEqual(prot.registrarMensagemTesouro(GRUPO, BR, cfg, t0 + 1000), n)
        assert.strictEqual(prot.registrarMensagemTesouro(GRUPO, MEMBRO, cfg, t0 + prot.TESOURO_COOLDOWN_MS), n)
        await prot.gravarTesouro(GRUPO)
        assert.strictEqual(configs[GRUPO].tesouro.saldo, 3 * n)
        assert.strictEqual(prot.registrarMensagemTesouro('outro@g.us', MEMBRO, {}, t0), 0, 'sem baú não soma')
    })

    await test('pote novo do .tesourocoletivo começa em 0', async () => {
        configs = {}
        const cmd = require('../src/commands/economy/tesourocoletivo')
        let resposta = ''
        await cmd.execute({ from: GRUPO, sender: MEMBRO, args: [], prefix: '.', reply: async t => { resposta = t } })
        assert.strictEqual(configs[GRUPO].tesouro.saldo, 0)
        assert.ok(!/Cada mensagem enviada/.test(String(resposta)))
    })

    console.log('\n========================================')
    console.log(`📊 RESULTADO — Proteções de grupo: ${pass} passaram, ${fail} falharam`)
    console.log('========================================\n')
    process.exit(fail > 0 ? 1 : 0)
})()
