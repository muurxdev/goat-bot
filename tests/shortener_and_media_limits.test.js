/**
 * Testes Automatizados: Encurtador Multi-Provedores e Limites de Mídia (100MB Direto / Documento / Drive 5TB)
 */

process.env.NODE_ENV = 'test'

const assert = require('assert')
const shortenerService = require('../src/services/shortenerService')
const audioSender = require('../src/services/media/audioSender')
const videoSender = require('../src/services/media/videoSender')
const encurtarCmd = require('../src/commands/dev/encurtar')

let pass = 0
let fail = 0

async function test(name, fn) {
    try {
        await fn()
        pass++
        console.log(`  ✅ PASS: ${name}`)
    } catch (e) {
        fail++
        console.log(`  ❌ FAIL: ${name}`)
        console.log(`      ${e.stack || e.message}`)
    }
}

async function run() {
    console.log('\n--- 1. Limites de Mídia (Áudio e Vídeo) ---')

    await test('audioSender define LIMITE_AUDIO em 100 MB e LIMITE_DOCUMENTO em 2 GB', () => {
        assert.strictEqual(typeof audioSender.LIMITE_AUDIO, 'number')
        assert.strictEqual(typeof audioSender.LIMITE_DOCUMENTO, 'number')
        assert.strictEqual(audioSender.LIMITE_AUDIO, 100 * 1024 * 1024, 'Áudio até 100MB vai direto')
        assert.strictEqual(audioSender.LIMITE_DOCUMENTO, 2000 * 1024 * 1024, 'Documento até 2GB')
    })

    await test('videoSender define LIMITE_GALERIA em 100 MB e LIMITE_DOCUMENTO em 2 GB', () => {
        assert.strictEqual(typeof videoSender.LIMITE_GALERIA, 'number')
        assert.strictEqual(typeof videoSender.LIMITE_DOCUMENTO, 'number')
        assert.strictEqual(videoSender.LIMITE_GALERIA, 100 * 1024 * 1024, 'Vídeo até 100MB vai direto sem compressão')
        assert.strictEqual(videoSender.LIMITE_DOCUMENTO, 2000 * 1024 * 1024, 'Documento até 2GB')
    })

    console.log('\n--- 2. Serviço de Encurtador Resiliente (shortenerService) ---')

    await test('Encurta link longo do Spotify com sucesso', async () => {
        const spotifyUrl = 'https://open.spotify.com/intl-pt/track/532c5QACGW10DFZWyNaMKL?si=b6ac804a423c4202'
        const res = await shortenerService.shortenUrl(spotifyUrl)
        assert.ok(res.shortUrl, 'Deve retornar shortUrl')
        assert.ok(res.shortUrl.startsWith('http'), 'Deve iniciar com http')
        assert.ok(res.provider, 'Deve identificar o provedor utilizado')
    })

    await test('Encurta URL sem protocolo (adiciona https:// automaticamente)', async () => {
        const res = await shortenerService.shortenUrl('google.com/search?q=goat-bot')
        assert.ok(res.shortUrl.startsWith('http'))
        assert.ok(res.originalUrl.startsWith('https://'))
    })

    await test('Comando .encurtar executa e formata resposta com sucesso', async () => {
        let sentMessage = ''
        await encurtarCmd.execute({
            args: ['https://github.com/muurxdev/MeliodasBot'],
            reply: (msg) => { sentMessage = msg }
        })
        assert.ok(sentMessage.includes('LINK ENCURTADO'))
        assert.ok(sentMessage.includes('Puro p/ Copiar'))
    })

    console.log(`\n========================================`)
    console.log(`Resultados dos Testes: ${pass} PASSOU | ${fail} FALHOU`)
    console.log(`========================================\n`)

    if (fail > 0) process.exit(1)
}

run().catch(err => {
    console.error('Erro fatal:', err)
    process.exit(1)
})

