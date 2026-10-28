process.env.NODE_ENV = 'test'

/**
 * .dossie mostra a ficha de QUEM FOI RESPONDIDO/MARCADO, não de quem pediu.
 *
 * O defeito (2026-09-21): o handler lia a mensagem respondida só de
 * `info.message.extendedTextMessage`. Em grupo com mensagens temporárias a
 * mensagem chega envelopada (`ephemeralMessage`) e a leitura voltava vazia — o
 * .dossie caía na ficha de quem pediu. O mesmo valia para ~80 comandos que
 * usam resposta.
 */

const assert = require('assert')
const dataService = require('../src/services/dataService')
const handler = require('../src/handlers/messageHandler')
require('../src/handlers/commandDispatcher').loadCommands()

let ok = 0, falhou = 0
async function teste(nome, fn) {
    try { await fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

const GRUPO = '120363000000000088@g.us'
const sufixo = String(Date.now()).slice(-7)
const A = { lid: `71${sufixo}00001@lid`, nick: 'QuemPediu' + sufixo }
const B = { lid: `71${sufixo}00002@lid`, nick: 'Respondido' + sufixo }

for (const p of [A, B]) {
    const u = dataService.initializeUser(p.lid, {}, [p.lid])
    Object.assign(u, { registered: true, displayNick: p.nick, display_nick: p.nick, registeredAt: new Date().toISOString() })
    dataService.saveUser(u, { force: true })
}

function cliente() {
    const enviadas = []
    return {
        enviadas,
        user: { id: '553597379643:1@s.whatsapp.net', lid: '99999999999999:1@lid' },
        groupMetadata: async () => ({ subject: 'T', participants: [{ id: '99999999999999@lid', admin: 'admin' }, { id: A.lid }, { id: B.lid }] }),
        groupFetchAllParticipating: async () => ({}),
        sendMessage: async (jid, c) => { enviadas.push(c); return { key: { id: 'R' + enviadas.length } } },
        readMessages: async () => {}, sendPresenceUpdate: async () => {}, profilePictureUrl: async () => null
    }
}
const texto = c => c.enviadas.map(m => m.text || m.caption || '').join('\n')
const resposta = { stanzaId: 'Q1', participant: B.lid, quotedMessage: { conversation: 'oi 5511987654321' } }
let n = 0
// O .dossie tem espera de 2 s por pessoa; cada caso espera ela passar.
const esperar = () => new Promise(r => setTimeout(r, 2100))
const msg = conteudo => ({ key: { remoteJid: GRUPO, participant: A.lid, id: 'D' + (++n) }, message: conteudo, pushName: 'A' })

async function main() {
    console.log('\n🧪 Alvo do .dossie...\n')
    // O modo aluguel pode estar ligado por padrão no ambiente (na VPS está), e
    // aí o grupo de teste, sem plano, não roda comando nenhum. O que se testa
    // aqui é o alvo da ficha, não o aluguel.
    await require('../src/services/rentalService').setRentalMode(false, GRUPO)
    const casos = {
        'resposta comum': { extendedTextMessage: { text: '.dossie', contextInfo: resposta } },
        'resposta em grupo com mensagens temporárias': { ephemeralMessage: { message: { extendedTextMessage: { text: '.dossie', contextInfo: resposta } } } },
        'marcação em grupo com mensagens temporárias': { ephemeralMessage: { message: { extendedTextMessage: { text: '.dossie @x', contextInfo: { mentionedJid: [B.lid] } } } } }
    }
    for (const [nome, conteudo] of Object.entries(casos)) {
        await teste(`${nome}: ficha de quem foi respondido`, async () => {
            await esperar()
            const c = cliente()
            await handler.handleIncomingMessage(c, { messages: [msg(conteudo)] })
            const t = texto(c)
            assert.ok(t.toUpperCase().includes(B.nick.toUpperCase()), `não saiu a ficha do alvo:\n${t.slice(0, 300)}`)
            assert.ok(!t.toUpperCase().includes(('Ficha de ' + A.nick).toUpperCase()), 'saiu a ficha de quem pediu')
        })
    }
    await teste('sem alvo, a ficha é de quem pediu', async () => {
        await esperar()
        const c = cliente()
        await handler.handleIncomingMessage(c, { messages: [msg({ ephemeralMessage: { message: { conversation: '.dossie' } } })] })
        assert.ok(texto(c).toUpperCase().includes(A.nick.toUpperCase()), texto(c).slice(0, 300))
    })
    console.log(`\n📊 Alvo do .dossie: ✅ ${ok}  ❌ ${falhou}\n`)
    process.exit(falhou ? 1 : 0)
}
main().catch(e => { console.error(e); process.exit(1) })
