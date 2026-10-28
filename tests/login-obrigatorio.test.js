process.env.NODE_ENV = 'test'
// O env.js lê os donos no require: definir ANTES de carregar o handler.
// Número único por execução: o banco de testes é persistente e já tem usuários de fixture registrados.
const DONO = `55119${String(Date.now()).slice(-8)}@s.whatsapp.net`
// LID do dono que o WhatsApp NÃO mapeia para o telefone: o único jeito de reconhecê-lo é listar o LID em
// BOT_OWNER_IDS (o env.js compara os dígitos antes do "@").
const LID_DONO_SEM_MAPA = `66${String(Date.now()).slice(-12)}@lid`
process.env.BOT_OWNER_ID = DONO
process.env.BOT_OWNER_IDS = LID_DONO_SEM_MAPA

/**
 * Login obrigatório (decisão do dono, 2026-09-21).
 *
 * Sem `.login`, NENHUM comando responde — em grupo e no PV. Só o próprio
 * `.login` (e seus apelidos) passa, para a pessoa conseguir se cadastrar. Os
 * atalhos do dispatch (seção direta, link colado) também ficam barrados.
 *
 * Exceção (decisão do dono, 2026-10-15): o DONO nunca é barrado.
 */

const assert = require('assert')
const dataService = require('../src/services/dataService')
const handler = require('../src/handlers/messageHandler')
// Sem o registro carregado o .login não é reconhecido — no bot isso acontece no boot.
require('../src/handlers/commandDispatcher').loadCommands()

let ok = 0, falhou = 0
async function teste(nome, fn) {
    try { await fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

const BOT = { id: '553597379643:1@s.whatsapp.net', lid: '99999999999999:1@lid' }
const GRUPO = '120363000000000001@g.us'

function clienteFalso() {
    const enviadas = []
    return {
        enviadas,
        user: BOT,
        groupMetadata: async () => ({ subject: 'Teste', participants: [{ id: '99999999999999@lid', admin: 'admin' }] }),
        sendMessage: async (jid, conteudo) => { enviadas.push({ jid, conteudo }); return { key: { id: 'X' + enviadas.length } } },
        readMessages: async () => {},
        sendPresenceUpdate: async () => {},
        profilePictureUrl: async () => null
    }
}

let seq = 0
function mensagem({ texto, noGrupo, autor }) {
    seq++
    return noGrupo
        ? { key: { remoteJid: GRUPO, participant: autor, id: 'LG' + seq }, message: { conversation: texto }, pushName: 'Teste' }
        : { key: { remoteJid: autor, id: 'LP' + seq }, message: { conversation: texto }, pushName: 'Teste' }
}

const textos = c => c.enviadas.map(e => e.conteudo && (e.conteudo.text || e.conteudo.caption)).filter(Boolean).join('\n---\n')
const pediuLogin = c => /precisa criar seu login/i.test(textos(c))

async function main() {
    console.log('\n🧪 Login obrigatório...\n')

    for (const noGrupo of [false, true]) {
        const onde = noGrupo ? 'no grupo' : 'no PV'
        const autor = `55119${String(Date.now()).slice(-6)}${noGrupo ? 1 : 2}@s.whatsapp.net`

        for (const cmd of ['.ping', '.menu', '.play numb', '.rpg', '.https://youtu.be/dQw4w9WgXcQ', '.comandoquenaoexiste']) {
            await teste(`sem login, "${cmd}" é barrado ${onde}`, async () => {
                const c = clienteFalso()
                await handler.handleIncomingMessage(c, { messages: [mensagem({ texto: cmd, noGrupo, autor })] })
                assert.ok(pediuLogin(c), `não pediu login. Respostas:\n${textos(c) || '(nenhuma)'}`)
            })
        }

        await teste(`o .login funciona sem cadastro ${onde} e libera o resto`, async () => {
            const c = clienteFalso()
            await handler.handleIncomingMessage(c, { messages: [mensagem({ texto: '.login Testador', noGrupo, autor })] })
            assert.ok(!pediuLogin(c), 'o próprio .login foi barrado')
            const u = dataService.getUser(autor)
            assert.ok(u && u.registered, 'o cadastro não foi gravado')

            const c2 = clienteFalso()
            await handler.handleIncomingMessage(c2, { messages: [mensagem({ texto: '.ping', noGrupo, autor })] })
            assert.ok(!pediuLogin(c2), 'cadastrado continuou barrado')
        })
    }

    await teste('o login é global: feito no PV, vale no grupo', async () => {
        const autor = `55119${String(Date.now()).slice(-6)}3@s.whatsapp.net`
        await handler.handleIncomingMessage(clienteFalso(), { messages: [mensagem({ texto: '.login Global', noGrupo: false, autor })] })
        const c = clienteFalso()
        await handler.handleIncomingMessage(c, { messages: [mensagem({ texto: '.ping', noGrupo: true, autor })] })
        assert.ok(!pediuLogin(c), 'login do PV não valeu no grupo')
    })

    await teste('DONO sem login responde (PV e grupo): a trava de login não vale para ele', async () => {
        for (const noGrupo of [false, true]) {
            const c = clienteFalso()
            await handler.handleIncomingMessage(c, { messages: [mensagem({ texto: '.ping', noGrupo, autor: DONO })] })
            assert.ok(!pediuLogin(c), `o dono foi barrado ${noGrupo ? 'no grupo' : 'no PV'}:\n${textos(c) || '(nenhuma)'}`)
            assert.ok(c.enviadas.length > 0, `o dono não recebeu resposta nenhuma ${noGrupo ? 'no grupo' : 'no PV'}`)
        }
    })

    await teste('quem NÃO é dono continua barrado sem login', async () => {
        const c = clienteFalso()
        await handler.handleIncomingMessage(c, { messages: [mensagem({ texto: '.ping', noGrupo: false, autor: '5511988887777@s.whatsapp.net' })] })
        assert.ok(pediuLogin(c), 'não-dono passou sem login')
    })

    await teste('dono que chega como @lid (telefone só pelo mapeamento LID→número) também passa', async () => {
        const c = clienteFalso()
        c.signalRepository = { lidMapping: { getPNForLID: async () => DONO } }
        const lidDoDono = `88${String(Date.now()).slice(-12)}@lid`
        await handler.handleIncomingMessage(c, { messages: [mensagem({ texto: '.ping', noGrupo: true, autor: lidDoDono })] })
        assert.ok(!pediuLogin(c), `dono por LID foi barrado:\n${textos(c) || '(nenhuma)'}`)
        assert.ok(c.enviadas.length > 0, 'o dono por LID não recebeu resposta')
    })

    await teste('dono que chega como @lid SEM mapeamento passa se o LID está em BOT_OWNER_IDS', async () => {
        const c = clienteFalso() // sem signalRepository: o bot não consegue traduzir o LID para telefone
        await handler.handleIncomingMessage(c, { messages: [mensagem({ texto: '.ping', noGrupo: true, autor: LID_DONO_SEM_MAPA })] })
        assert.ok(!pediuLogin(c), `dono por LID sem mapa foi barrado:\n${textos(c) || '(nenhuma)'}`)
        assert.ok(c.enviadas.length > 0, 'o dono por LID sem mapa não recebeu resposta')
    })

    await teste('@lid de quem NÃO é dono, mesmo com mapeamento, continua barrado', async () => {
        const c = clienteFalso()
        c.signalRepository = { lidMapping: { getPNForLID: async () => '5511977776666@s.whatsapp.net' } }
        const lid = `77${String(Date.now()).slice(-12)}@lid`
        await handler.handleIncomingMessage(c, { messages: [mensagem({ texto: '.ping', noGrupo: true, autor: lid })] })
        assert.ok(pediuLogin(c), 'LID de não-dono passou sem login')
    })

    console.log(`\n📊 Login obrigatório: ✅ ${ok}  ❌ ${falhou}\n`)
    process.exit(falhou > 0 ? 1 : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
