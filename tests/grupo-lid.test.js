/**
 * Testes de grupo com identificadores LID (Baileys 7).
 *
 * O que precisa continuar verdadeiro — cada item já quebrou em produção ou foi
 * pego pela auditoria de 2026-09-15, depois da troca do número do bot:
 *  - O bot é reconhecido em qualquer forma de JID (número, LID, com sufixo).
 *  - .rebaixartodos NÃO rebaixa o próprio bot nem quem pediu em grupo LID.
 *  - .aceitar @user e .aceitar <número> acham o pedido mesmo quando ele vem em LID.
 *  - O bot não se anuncia nem se parabeniza nos eventos de grupo.
 *  - .codificar não lança por ler um campo que o contexto não tem.
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const gas = require('../src/services/groupAuthService')

let pass = 0, fail = 0
async function test(nome, fn) {
    try { await fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

const GRUPO = '120363429142602973@g.us'
const BOT = { id: '553597379643:1@s.whatsapp.net', lid: '99999999999999:1@lid' }
const DONO_LID = '42224477798582@lid'

function clienteFalso(extra = {}) {
    const chamadas = { enviadas: [], participantes: [], pedidos: [] }
    return {
        chamadas,
        user: BOT,
        sendMessage: async (jid, conteudo) => { chamadas.enviadas.push({ jid, conteudo }); return { key: { id: 'X' } } },
        groupParticipantsUpdate: async (jid, lista, acao) => { chamadas.participantes.push({ lista, acao }); return lista.map(j => ({ jid: j, status: '200' })) },
        groupRequestParticipantsUpdate: async (jid, lista, acao) => { chamadas.pedidos.push({ lista, acao }); return lista.map(j => ({ jid: j, status: '200' })) },
        ...extra
    }
}

;(async () => {
    console.log('🧪 Testes de grupo com LID...\n')

    await test('isBotJid reconhece o bot por número, LID e sufixo de dispositivo', () => {
        const c = clienteFalso()
        for (const j of ['553597379643@s.whatsapp.net', '553597379643:1@s.whatsapp.net', '99999999999999@lid', '99999999999999:1@lid']) {
            assert.ok(gas.isBotJid(j, c), `deveria reconhecer ${j}`)
        }
        for (const j of [DONO_LID, '5516997110418@s.whatsapp.net', '', null, undefined]) {
            assert.ok(!gas.isBotJid(j, c), `não deveria reconhecer ${j}`)
        }
    })

    await test('.rebaixartodos não rebaixa o próprio bot nem quem pediu', async () => {
        const cmd = require('../src/commands/admin/rebaixartodos')
        const c = clienteFalso({
            groupMetadata: async () => ({
                participants: [
                    { id: '99999999999999@lid', admin: 'admin' },       // o bot
                    { id: DONO_LID, admin: 'superadmin' },              // quem pediu
                    { id: '11111111111111@lid', admin: 'admin' },       // deve cair
                    { id: '22222222222222@lid', admin: null }           // não é admin
                ]
            })
        })
        await cmd.execute({ client: c, from: GRUPO, sender: DONO_LID, senderReal: '5516997110418@s.whatsapp.net', reply: async () => {} })
        assert.strictEqual(c.chamadas.participantes.length, 1, 'deveria chamar a API uma vez')
        assert.deepStrictEqual(c.chamadas.participantes[0].lista, ['11111111111111@lid'])
        assert.strictEqual(c.chamadas.participantes[0].acao, 'demote')
    })

    await test('.rebaixartodos sem outros admins não chama a API', async () => {
        const cmd = require('../src/commands/admin/rebaixartodos')
        const c = clienteFalso({ groupMetadata: async () => ({ participants: [{ id: '99999999999999@lid', admin: 'admin' }, { id: DONO_LID, admin: 'admin' }] }) })
        let resposta = ''
        await cmd.execute({ client: c, from: GRUPO, sender: DONO_LID, reply: async t => { resposta = t } })
        assert.strictEqual(c.chamadas.participantes.length, 0)
        assert.ok(/Não há outros administradores/.test(resposta), resposta)
    })

    const PEDIDOS = [{ jid: '33333333333333@lid', phone_number: '5511988887777@s.whatsapp.net', request_time: '1700000000' }]

    await test('.aceitar @user acha o pedido em LID pela menção', async () => {
        const cmd = require('../src/commands/admin/solicitacoes')
        const c = clienteFalso({ groupRequestParticipantsList: async () => PEDIDOS })
        await cmd.execute({ client: c, from: GRUPO, sender: DONO_LID, commandName: 'aceitar', args: ['@33333333333333'], mentionedJid: ['33333333333333@lid'], info: {}, reply: async () => {} })
        assert.deepStrictEqual(c.chamadas.pedidos, [{ lista: ['33333333333333@lid'], acao: 'approve' }])
    })

    await test('.aceitar <número> acha o pedido LID pelo telefone', async () => {
        const cmd = require('../src/commands/admin/solicitacoes')
        const c = clienteFalso({ groupRequestParticipantsList: async () => PEDIDOS })
        await cmd.execute({ client: c, from: GRUPO, sender: DONO_LID, commandName: 'aceitar', args: ['5511988887777'], mentionedJid: [], info: {}, reply: async () => {} })
        assert.deepStrictEqual(c.chamadas.pedidos, [{ lista: ['33333333333333@lid'], acao: 'approve' }])
    })

    await test('.aceitar de quem não pediu avisa e não chama a API', async () => {
        const cmd = require('../src/commands/admin/solicitacoes')
        const c = clienteFalso({ groupRequestParticipantsList: async () => PEDIDOS })
        let resposta = ''
        await cmd.execute({ client: c, from: GRUPO, sender: DONO_LID, commandName: 'aceitar', args: ['5521900000000'], mentionedJid: [], info: {}, reply: async t => { resposta = t } })
        assert.strictEqual(c.chamadas.pedidos.length, 0)
        assert.ok(/Não encontrei solicitação/.test(resposta), resposta)
    })

    await test('evento de grupo do próprio bot não gera anúncio', async () => {
        const { handleGroupParticipantsUpdate } = require('../src/handlers/groupEventsHandler')
        const c = clienteFalso({ groupMetadata: async () => ({ subject: 'Teste', participants: [] }) })
        await handleGroupParticipantsUpdate(c, { id: GRUPO, participants: ['99999999999999@lid'], action: 'promote', author: DONO_LID })
        assert.strictEqual(c.chamadas.enviadas.length, 0, 'o bot não pode se parabenizar')
    })

    await test('promoção de outra pessoa continua sendo anunciada', async () => {
        const { handleGroupParticipantsUpdate } = require('../src/handlers/groupEventsHandler')
        const c = clienteFalso({ groupMetadata: async () => ({ subject: 'Teste', participants: [] }) })
        await handleGroupParticipantsUpdate(c, { id: GRUPO, participants: ['11111111111111@lid'], action: 'promote', author: DONO_LID })
        // Além do texto pode sair a figurinha do evento (assets/figurinhas/promocao).
        const anuncio = c.chamadas.enviadas.find(e => e.conteudo.text)
        assert.ok(anuncio, 'a promoção precisa ser anunciada')
        assert.ok(anuncio.conteudo.mentions.includes('11111111111111@lid'))
        assert.ok(c.chamadas.enviadas.every(e => e.conteudo.text || e.conteudo.sticker), 'só texto e figurinha nesse evento')
    })

    await test('.codificar e .decodificar não lançam e decodificam', async () => {
        const cmd = require('../src/commands/adicional/codificar')
        let resposta = ''
        await cmd.execute({ reply: async t => { resposta = t }, commandName: 'decodificar', args: ['base64', Buffer.from('Olá Mundo').toString('base64')], prefix: '.' })
        assert.ok(resposta.includes('Olá Mundo'), 'deveria conter o texto decodificado')
        resposta = ''
        await cmd.execute({ reply: async t => { resposta = t }, args: [], prefix: '.' })
        assert.ok(resposta.length > 0, 'sem argumentos deve responder o uso')
    })

    console.log('\n========================================')
    console.log(`📊 RESULTADO — Grupo/LID: ${pass} passaram, ${fail} falharam`)
    console.log('========================================\n')
    process.exit(fail > 0 ? 1 : 0)
})()
