/**
 * Testes da qualidade de mídia e dos cartões em imagem.
 *
 * O que precisa continuar verdadeiro (auditoria de mídia de 2026-09-17):
 *  - Cartões saem em 1280x720 JPEG, sem quebrar com nick hostil ("<", "&", emoji).
 *  - A prévia de imagem é nítida (320 px) e traz largura/altura; texto passa intacto.
 *  - Nota de voz sai em OGG/Opus com o mimetype certo.
 *  - Vídeo padrão prefere H.264 até 1080p; "hd" prioriza resolução.
 *  - Figurinha animada fica abaixo de 500 KB; estática em WebP 512x512.
 *  - O glossário não estraga nome próprio ("Lobo Full Stack").
 *  - .cmd desliga o comando por todos os nomes (grava o nome principal).
 */
process.env.NODE_ENV = 'test'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')
const sharp = require('sharp')

let pass = 0, fail = 0
async function test(nome, fn) {
    try { await fn(); console.log('  ✅ PASS: ' + nome); pass++ }
    catch (e) { console.log('  ❌ FAIL: ' + nome + '\n     ' + e.message); fail++ }
}

function temFfmpeg() {
    try {
        execFileSync('ffmpeg', ['-hide_banner', '-version'], { stdio: 'ignore' })
        return true
    } catch (err) {
        console.log('  ⚠️ ffmpeg ausente, pulando testes que dependem dele: ' + err.message)
        return false
    }
}

;(async () => {
    console.log('🧪 Testes de mídia e cartões...\n')
    const cartao = require('../src/services/cartaoService')

    await test('cartões saem em 1280x720 e aguentam nick hostil', async () => {
        const foto = await sharp({ create: { width: 300, height: 300, channels: 3, background: '#3366aa' } }).png().toBuffer()
        const saidas = [
            await cartao.cartaoPerfil({ nome: '<b>&"Ban"🐉', nivel: 3, xpAtual: 10, xpNecessario: 100, stats: [['Poder', 99]], foto }),
            await cartao.cartaoNivel({ nome: 'A&B', nivelAntes: 1, nivelDepois: 2, ganhos: [['Vida', '+15']] }),
            await cartao.cartaoRanking({ titulo: 'Grupo <teste>', linhas: [{ pos: 1, nome: '🔥', valor: '10', detalhe: 'x', destaque: true }] }),
            await cartao.cartaoBoasVindas({ nome: 'Novo', grupo: 'Grupo & Cia' }),
            await cartao.cartaoRpg({ nome: 'X', nivel: 1, cp: 1, atk: 1, def: 1, hp: 1, hpMax: 2, equipamentos: [['Arma', '']] })
        ]
        for (const b of saidas) {
            const m = await sharp(b).metadata()
            assert.strictEqual(m.format, 'jpeg')
            assert.strictEqual(m.width, 1280)
            assert.strictEqual(m.height, 720)
        }
    })

    await test('cortar tira emoji e corta com reticências', () => {
        assert.strictEqual(cartao.cortar('🐉 GOAT', 20), 'GOAT')
        assert.strictEqual(cartao.cortar('abcdefghij', 5), 'abcd…')
        assert.strictEqual(cartao.cortar('🔥', 10, 'reserva'), 'reserva')
    })

    await test('enviarComCartao: legenda curta vai junto; sem cliente cai no texto', async () => {
        const enviados = []
        const client = { sendMessage: async (jid, c) => enviados.push(c) }
        let respondido = null
        const reply = async t => { respondido = t }
        await cartao.enviarComCartao({ ctx: { client, from: 'g@g.us', reply }, texto: 'curto', gerar: async () => Buffer.from('img') })
        assert.strictEqual(enviados[0].caption, 'curto')
        await cartao.enviarComCartao({ ctx: { client, from: 'g@g.us', reply }, texto: 'x'.repeat(1100), gerar: async () => Buffer.from('img') })
        assert.ok(enviados[1].image && !enviados[1].caption)
        assert.strictEqual(respondido.length, 1100)
        respondido = null
        await cartao.enviarComCartao({ ctx: { client, from: 'g@g.us', reply }, texto: 'falhou', gerar: async () => { throw new Error('x') } })
        assert.strictEqual(respondido, 'falhou')
    })

    await test('prévia de imagem com 320 px e dimensões; texto intacto', async () => {
        const { completarPrevia } = require('../src/services/media/miniatura')
        const img = await sharp({ create: { width: 1920, height: 1080, channels: 3, background: '#aa3366' } }).jpeg().toBuffer()
        const r = await completarPrevia({ image: img, caption: 'oi' })
        assert.strictEqual(r.width, 1920)
        assert.strictEqual(r.height, 1080)
        assert.strictEqual((await sharp(r.jpegThumbnail).metadata()).width, 320)
        const texto = { text: 'oi' }
        assert.strictEqual(await completarPrevia(texto), texto)
        const remota = { image: { url: 'https://exemplo.com/a.jpg' } }
        assert.strictEqual(await completarPrevia(remota), remota)
    })

    // Desde 2026-09-20 não há mais teto de 1080p: o dono pediu a maior qualidade
    // existente. O H.264 virou DESEMPATE — entre dois formatos da mesma
    // resolução vem o que não precisa de conversão.
    await test('todo vídeo prioriza resolução; H.264 só desempata', () => {
        const { resolveDownloadFormat } = require('../src/services/media/formatResolver')
        const ordem = q => { const a = resolveDownloadFormat({ format: 'mp4', quality: q }).args; return a[a.indexOf('-S') + 1] }
        for (const q of ['best', 'hd']) {
            assert.ok(ordem(q).startsWith('res,fps'), `${q}: ${ordem(q)}`)
            assert.ok(ordem(q).indexOf('vcodec:h264') > ordem(q).indexOf('res'), `${q}: codec antes da resolução`)
            assert.ok(!/res:\d/.test(ordem(q)), `${q} voltou a ter teto de altura: ${ordem(q)}`)
        }
    })

    await test('glossário preserva nome próprio e ainda traduz jargão', () => {
        const { traduzir } = require('../src/services/loreService')
        assert.strictEqual(traduzir('🐺 Lobo Full Stack'), '🐺 Lobo Full Stack')
        assert.strictEqual(traduzir('Mundo: Servidor Infernal'), 'Mundo: Servidor Infernal')
        assert.ok(!/servidor/i.test(traduzir('o servidor caiu')))
    })

    if (temFfmpeg()) {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'midia-teste-'))
        try {
            await test('nota de voz sai em OGG/Opus', async () => {
                const mp3 = path.join(tmp, 't.mp3')
                execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'sine=f=440:d=1', mp3])
                const { paraNotaDeVoz, ehOggOpus } = require('../src/services/media/notaDeVoz')
                const r = await paraNotaDeVoz(fs.readFileSync(mp3))
                assert.strictEqual(r.mimetype, 'audio/ogg; codecs=opus')
                assert.ok(ehOggOpus(r.buffer))
            })

            await test('figurinha animada abaixo de 500 KB e estática em 512x512', async () => {
                const mp4 = path.join(tmp, 'v.mp4')
                execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=480x854:rate=30', '-t', '3', '-pix_fmt', 'yuv420p', mp4])
                const { criarFigurinha } = require('../src/services/mediaService')
                const anim = await criarFigurinha(fs.readFileSync(mp4), true, 'p', 'a')
                assert.ok(anim.length <= 500 * 1024, `${Math.round(anim.length / 1024)} KB`)
                const img = await sharp({ create: { width: 900, height: 400, channels: 4, background: { r: 0, g: 200, b: 0, alpha: 0.5 } } }).png().toBuffer()
                const est = await criarFigurinha(img, false, 'p', 'a')
                const m = await sharp(est).metadata()
                assert.strictEqual(m.format, 'webp')
                assert.strictEqual(m.width, 512)
                assert.strictEqual(m.height, 512)
            })
        } finally {
            fs.rmSync(tmp, { recursive: true, force: true })
        }
    }

    await test('.cmd grava o nome principal ao desligar por apelido', async () => {
        const dispatcher = require('../src/handlers/commandDispatcher')
        dispatcher.loadCommands()
        const play = dispatcher.findCommand('play')
        const apelido = (play.aliases || [])[0]
        assert.ok(apelido, 'o .play precisa ter apelido para este teste')
        const dataService = require('../src/services/dataService')
        const grupo = '120363999999999999@g.us'
        const configs = dataService.getConfigsData()
        const antes = configs[grupo]
        try {
            configs[grupo] = { disabledCommands: [] }
            const cmd = dispatcher.findCommand('cmd')
            await cmd.execute({ args: [apelido, 'off'], from: grupo, isGroup: true, isAdmin: true, isOwner: true, sender: '5511900000001@s.whatsapp.net', prefix: '.', reply: async () => {} })
            assert.deepStrictEqual(dataService.getConfigsData()[grupo].disabledCommands, ['play'])
        } finally {
            if (antes === undefined) delete configs[grupo]
            else configs[grupo] = antes
            await dataService.saveConfigsData(configs)
        }
    })

    console.log('\n========================================')
    console.log(`📊 RESULTADO — Mídia e cartões: ${pass} passaram, ${fail} falharam`)
    console.log('========================================\n')
    process.exit(fail > 0 ? 1 : 0)
})()
