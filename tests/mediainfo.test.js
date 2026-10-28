process.env.NODE_ENV = 'test'

/**
 * .mediainfo e reconhecimento de links (2026-09-21).
 *
 *  - Responder (arrastar) uma mídia basta: nada de marcar ninguém. Vale também
 *    com a mídia dentro de mensagem temporária e de visualização única.
 *  - A ficha traz os dados reais do arquivo (resolução em px, codec, fps…).
 *  - Qualidade de vídeo vertical se nomeia pelo lado menor (1080×1920 é 1080p,
 *    não "2K").
 *  - Plataforma decidida pelo host: link do Dropbox não é Twitter.
 */

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')
const sharp = require('sharp')

// No lugar do download do WhatsApp, copia um arquivo gerado aqui.
const fichaTecnica = require('../src/services/media/fichaTecnica')
let arquivoFalso = null
fichaTecnica.baixarMidiaParaArquivo = async (_embrulho, _client, destino) => { fs.copyFileSync(arquivoFalso, destino); return destino }

const cmd = require('../src/commands/media/mediainfo')
const { qualityLabel } = require('../src/services/media/formatResolver')
const { identificarLink, ehPlataforma } = require('../src/services/media/plataformas')
const { lerExif, fichaDoArquivo } = require('../src/services/media/fichaTecnica')
const { molduraQuebrada } = require('./helpers/moldura')

let ok = 0, falhou = 0
async function teste(nome, fn) {
    try { await fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mediainfo-'))
const temFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0

/** Roda o comando como se alguém tivesse respondido `quotedMsg` com .mediainfo. */
async function responderCom(quotedMsg) {
    const respostas = []
    await cmd.execute({
        info: {
            key: { remoteJid: 'g@g.us', id: 'M1', participant: 'a@lid' },
            message: { extendedTextMessage: { text: '.mediainfo', contextInfo: { stanzaId: 'Q1', participant: 'b@lid', quotedMessage: quotedMsg || undefined } } }
        },
        quotedMsg, quotedSender: quotedMsg ? 'b@lid' : null, from: 'g@g.us',
        client: { sendMessage: async () => ({}), updateMediaMessage: async m => m },
        reply: async t => { respostas.push(t) }, directText: '', quotedText: '', sender: 'a@lid', prefix: '.'
    })
    return respostas.join('\n')
}

async function main() {
    console.log('\n🧪 .mediainfo e links...\n')

    await teste('qualidade de vídeo vertical se nomeia pelo lado menor', () => {
        assert.strictEqual(qualityLabel(1920, 1080), '1080p', 'vertical 1080×1920 não é 2K')
        assert.strictEqual(qualityLabel(1080, 1920), '1080p')
        assert.strictEqual(qualityLabel(1024, 576), '576p')
        assert.strictEqual(qualityLabel(3840, 2160), '4K')
        assert.strictEqual(qualityLabel(1280, 720), '720p')
    })

    await teste('plataforma pelo host: Dropbox não é Twitter, "?ref=tiktok.com" não é TikTok', () => {
        assert.strictEqual(identificarLink('https://www.dropbox.com/s/a/v.mp4').nome, 'Dropbox')
        assert.strictEqual(ehPlataforma('https://www.dropbox.com/s/a/v.mp4', 'twitter'), false)
        assert.strictEqual(ehPlataforma('https://site.com/v?ref=tiktok.com', 'tiktok'), false)
        assert.strictEqual(identificarLink('https://x.com/a/status/1').nome, 'Twitter (X)')
        assert.strictEqual(identificarLink('https://vm.tiktok.com/ZM1/').chave, 'tiktok')
        assert.strictEqual(identificarLink('https://music.youtube.com/watch?v=1').tipo, 'áudio')
    })

    await teste('link direto de CDN tem o nome da plataforma, mas vai para o baixador genérico', () => {
        const r = identificarLink('https://i.pinimg.com/originals/a/b.jpg')
        assert.strictEqual(r.nome, 'Pinterest')
        assert.strictEqual(r.tipo, 'imagem')
        assert.strictEqual(ehPlataforma('https://i.pinimg.com/originals/a/b.jpg', 'pinterest'), false)
    })

    await teste('site desconhecido ganha nome pelo domínio e tipo pela extensão', () => {
        const r = identificarLink('https://cdn.exemplo.com.br/musicas/faixa.mp3')
        assert.strictEqual(r.nome, 'Exemplo')
        assert.strictEqual(r.tipo, 'áudio')
    })

    await teste('aviso de download mostra plataforma e tipo mesmo sem título', () => {
        const { legendaDoAviso } = require('../src/services/media/avisoDownload')
        const t = legendaDoAviso({ tipo: 'imagem ou vídeo', plataforma: 'Pinterest', previa: {} })
        assert.ok(t.includes('*Plataforma:* Pinterest') && t.includes('*Tipo:* Imagem ou vídeo'), t)
        assert.strictEqual(molduraQuebrada(t), null, t)
    })

    const png = path.join(dir, 'foto.png')
    await sharp({ create: { width: 1600, height: 900, channels: 4, background: '#3366ff80' } }).png().toFile(png)

    await teste('responder uma foto (dentro de visualização única e temporária) dá a ficha', async () => {
        arquivoFalso = png
        const quoted = { ephemeralMessage: { message: { viewOnceMessageV2: { message: { imageMessage: { mimetype: 'image/png', fileLength: fs.statSync(png).size, width: 1600, height: 900 } } } } } }
        const t = await responderCom(quoted)
        assert.ok(/FICHA DA IMAGEM/.test(t), t.slice(0, 300))
        assert.ok(t.includes('1600×900 px'), 'faltou a resolução em px')
        assert.ok(t.includes('*Transparência:* sim'), 'faltou a transparência')
        assert.ok(t.includes('*Visualização única:* sim'), 'não percebeu a visualização única')
        assert.strictEqual(molduraQuebrada(t), null, t)
    })

    await teste('mídia na própria mensagem (legenda .mediainfo) também vale', async () => {
        arquivoFalso = png
        const respostas = []
        await cmd.execute({
            info: { key: { remoteJid: 'g@g.us', id: 'M2' }, message: { imageMessage: { caption: '.mediainfo', mimetype: 'image/png' } } },
            quotedMsg: null, from: 'g@g.us', client: { sendMessage: async () => ({}) },
            reply: async t => { respostas.push(t) }, directText: '', quotedText: '', prefix: '.'
        })
        assert.ok(respostas.join('').includes('1600×900 px'), respostas.join('').slice(0, 300))
    })

    await teste('sem mídia e sem link, explica como usar (sem pedir marcação)', async () => {
        const t = await responderCom(null)
        assert.ok(/responda/i.test(t) && /Não precisa marcar/i.test(t), t.slice(0, 300))
    })

    await teste('mídia gigante não é baixada: mostra o que o WhatsApp informa', async () => {
        arquivoFalso = null
        const t = await responderCom({ videoMessage: { mimetype: 'video/mp4', fileLength: 5e9, seconds: 7200, width: 3840, height: 2160 } })
        assert.ok(/grande demais/i.test(t) && t.includes('3840×2160 px'), t.slice(0, 300))
    })

    await teste('EXIF: câmera, programa e data', async () => {
        const jpg = await sharp({ create: { width: 64, height: 48, channels: 3, background: '#ff0000' } })
            .jpeg().withExif({ IFD0: { Make: 'Canon', Model: 'EOS R5', DateTime: '2026:09:21 10:00:00', Software: 'Teste' } }).toBuffer()
        const exif = lerExif((await sharp(jpg).metadata()).exif)
        assert.strictEqual(exif.fabricante, 'Canon')
        assert.strictEqual(exif.modelo, 'EOS R5')
        assert.strictEqual(exif.data, '2026:09:21 10:00:00')
        assert.strictEqual(exif.programa, 'Teste')
    })

    if (!temFfmpeg) {
        console.log('  ⚠️  ffmpeg ausente: pulei a ficha de vídeo e áudio')
    } else {
        await teste('ficha de vídeo vertical: H.264, 576×1024 px, 30 fps e o áudio', async () => {
            const mp4 = path.join(dir, 'v.mp4')
            spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=576x1024:r=30:d=2', '-f', 'lavfi', '-i', 'sine=f=440:d=2:sample_rate=48000',
                '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', mp4])
            const t = await fichaDoArquivo(mp4, { mimetype: 'video/mp4' })
            assert.ok(t.includes('576×1024 px (576p)'), t)
            assert.ok(/H\.264 · High/.test(t), 'faltou codec com perfil')
            assert.ok(t.includes('30 fps (constante)'), 'faltou o fps')
            assert.ok(t.includes('*Orientação:* vertical'), 'faltou a orientação')
            assert.ok(t.includes('48 kHz') && t.includes('estéreo'), 'faltou o áudio')
            assert.strictEqual(molduraQuebrada(t), null, t)
        })

        await teste('ficha de MP3: 320 kbps, amostragem e canais', async () => {
            const mp3 = path.join(dir, 'a.mp3')
            spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=f=440:d=2:sample_rate=44100', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '320k', mp3])
            const t = await fichaDoArquivo(mp3, { mimetype: 'audio/mpeg' })
            assert.ok(/FICHA DO ÁUDIO/.test(t) && t.includes('320 kbps') && t.includes('44,1 kHz'), t)
        })
    }

    fs.rmSync(dir, { recursive: true, force: true })
    console.log(`\n📊 .mediainfo: ✅ ${ok}  ❌ ${falhou}\n`)
    process.exit(falhou ? 1 : 0)
}
main().catch(e => { console.error(e); process.exit(1) })
