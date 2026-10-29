process.env.NODE_ENV = 'test'

/**
 * A ficha de TODA mídia diz o tipo, de onde veio, quando foi postada e os próximos passos do
 * comando usado (pedido do dono, 2026-10-15). Antes o áudio do Spotify saía sem origem, sem tipo
 * e sem data, e o YouTube perdia a linha "Origem" (o filtro de valor vazio descartava "YouTube").
 */

const assert = require('assert')

let ok = 0, falhou = 0
function teste(nome, fn) {
    try { fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

const ficha = require('../src/services/media/fichaDaMidia')
const { formatMediaCaption } = require('../src/services/media/formatResolver')

console.log('\n🧪 Ficha completa de toda mídia...\n')

const probeVideo = {
    container: 'MP4', vcodec: 'h264', acodec: 'aac', bitrateKbps: 128, totalBitrateKbps: 2200, fps: 30,
    sampleRateHz: 44100, channels: 2, width: 1080, height: 1920, sizeBytes: 4200000, durationSec: 15,
    isAudio: false, hasVideo: true, tags: {}
}
const probeAudio = {
    container: 'MP3', vcodec: null, acodec: 'mp3', bitrateKbps: 320, totalBitrateKbps: 320, sampleRateHz: 44100,
    channels: 2, width: 0, height: 0, sizeBytes: 3500000, durationSec: 85, isAudio: true, hasVideo: false, tags: {}
}

teste('origemDe: o nome dado vence; sem nome, sai do host do link; "YouTube" nunca é descartado', () => {
    assert.strictEqual(ficha.origemDe({ plataforma: 'YouTube', url: '' }), 'YouTube')
    assert.strictEqual(ficha.origemDe({ plataforma: '', url: 'https://vm.tiktok.com/abc/' }), 'TikTok')
    assert.strictEqual(ficha.origemDe({ plataforma: 'Web', url: 'https://www.instagram.com/reel/x/' }), 'Instagram')
    assert.strictEqual(ficha.origemDe({ plataforma: '', url: '' }), '')
})

teste('proximosDe: YouTube/Spotify por nome; TikTok/Insta/X pelo próprio comando; SoundCloud sem "vídeo"', () => {
    const yt = ficha.proximosDe({ tipo: 'áudio', plataforma: 'YouTube', url: 'https://youtu.be/abc', titulo: 'Numb' })
    assert.deepStrictEqual(yt.map(p => p.nome + ' ' + p.args), ['play mp4 Numb', 'play capa Numb', 'play search Numb'])

    const tt = ficha.proximosDe({ tipo: 'vídeo', plataforma: 'TikTok', url: 'https://www.tiktok.com/@a/video/1' })
    assert.deepStrictEqual(tt.map(p => p.nome + ' ' + p.args), ['tiktok mp3 https://www.tiktok.com/@a/video/1'])

    const ttAudio = ficha.proximosDe({ tipo: 'áudio', plataforma: 'TikTok', url: 'https://www.tiktok.com/@a/video/1' })
    assert.deepStrictEqual(ttAudio.map(p => p.nome), ['tiktok'])
    assert.ok(!/^mp3/.test(ttAudio[0].args), 'sugeriu mp3 para quem já recebeu o áudio')

    const insta = ficha.proximosDe({ tipo: 'vídeo', url: 'https://www.instagram.com/reel/abc/' })
    assert.strictEqual(insta[0].nome, 'insta')

    const sc = ficha.proximosDe({ tipo: 'áudio', url: 'https://soundcloud.com/a/b' })
    assert.deepStrictEqual(sc, [], 'SoundCloud é só áudio: não há "outro formato" para sugerir')

    const longo = ficha.proximosDe({ tipo: 'vídeo', url: 'https://www.tiktok.com/@a/video/1?' + 'x'.repeat(120) })
    assert.ok(longo[0].args.includes('<link>'), 'link enorme devia virar <link>')

    assert.deepStrictEqual(ficha.proximosDe({ tipo: 'áudio', plataforma: 'Spotify', titulo: 'X', emLista: true }), [])
})

teste('.play (áudio): tipo, origem YouTube, data de publicação e próximos passos do .play', () => {
    const { _legenda } = require('../src/commands/media/play.js')
    const t = _legenda({
        prefix: '.', isAudio: true, title: 'RESTRIÇÃO E COMPROMISSO', author: 'DJ TRANSTORNO MENTAL - Topic',
        durationFormatted: '1:25', url: 'https://www.youtube.com/watch?v=duRrl-aYYBA', platform: 'YouTube',
        pedido: 'restrição e compromisso', uploadDate: '20240312'
    })
    assert.ok(t.includes('*Tipo:* Áudio'), t)
    assert.ok(t.includes('*Origem:* YouTube'), t)
    assert.ok(t.includes('*Publicado em:* 12/03/2024'), t)
    assert.ok(t.includes('*Artista:* DJ TRANSTORNO MENTAL') && !/Topic/.test(t), t)
    assert.ok(t.includes('`.play mp4 RESTRIÇÃO E COMPROMISSO`'), t)
    assert.ok(!/kHz|estéreo/.test(t))
    assert.ok(t.length <= 1024, `${t.length} caracteres`)
})

teste('.play (vídeo): "Tipo: Vídeo", "Canal" e a sugestão de só o áudio', () => {
    const { _legenda } = require('../src/commands/media/play.js')
    const t = _legenda({
        prefix: '.', isAudio: false, title: 'Clipe', author: 'Canal X', url: 'https://www.youtube.com/watch?v=abc',
        platform: 'YouTube', pedido: 'clipe', uploadDate: '20250101'
    })
    assert.ok(t.includes('*Tipo:* Vídeo') && t.includes('*Canal:* Canal X') && t.includes('*Origem:* YouTube'), t)
    assert.ok(t.includes('`.play Clipe` — só o áudio'), t)
})

teste('.spotify: tipo, origem (com a verdade sobre o arquivo), data e próximos passos — antes só tinha artista e duração', () => {
    const { _legenda } = require('../src/commands/media/spotify.js')
    const t = _legenda({
        prefix: '.', title: 'VÍCIO DESCOMUNAL - MC LIVINHO', author: 'MC Livinho - Topic', durationFormatted: '3:07',
        url: 'https://youtube.com/watch?v=AzX-RfqdTso', uploadDate: '20230520'
    })
    assert.ok(t.includes('*Tipo:* Áudio'), t)
    assert.ok(t.includes('*Origem:* Spotify (áudio pelo YouTube)'), t)
    assert.ok(t.includes('*Publicado em:* 20/05/2023'), t)
    assert.ok(t.includes('*Artista:* MC Livinho') && !/Topic/.test(t), t)
    // Desde 2026-10-26 (aa8e5ca2) o .spotify usa o bloco compartilhado COMANDOS PARA AJUDAR.
    assert.ok(/COMANDOS PARA AJUDAR/i.test(t) && t.includes('`.play mp4 VÍCIO DESCOMUNAL - MC LIVINHO`'), t)
    assert.ok(t.length <= 1024)
})

teste('.spotify em playlist: a faixa leva tipo/origem/data, mas sem repetir próximos passos', () => {
    const { _legenda } = require('../src/commands/media/spotify.js')
    const t = _legenda({ prefix: '.', title: 'Faixa 3', author: 'Alguém', durationFormatted: '2:00', url: 'https://youtube.com/watch?v=x', posicao: '3 de 10', uploadDate: '20200101' })
    assert.ok(t.includes('*Faixa:* 3 de 10') && t.includes('*Tipo:* Áudio') && t.includes('*Origem:*'), t)
    assert.ok(!/PRÓXIMOS PASSOS/i.test(t), 'repetiu próximos passos em toda faixa da playlist')
})

teste('formatMediaCaption (TikTok/Insta/X/Kwai…): origem, tipo, data, link e próximos passos do comando', () => {
    const t = formatMediaCaption({
        platform: 'TikTok', title: 'Dança nova', author: 'fulano', uploadDate: '20261001',
        url: 'https://www.tiktok.com/@fulano/video/7000000000000000000', filePath: '/tmp/x.mp4', fileProbe: probeVideo
    })
    assert.ok(t.includes('*Plataforma:* TikTok') && t.includes('*Tipo:* Vídeo'), t)
    assert.ok(t.includes('*Publicado em:* 01/10/2026'), t)
    assert.ok(t.includes('*Fonte:* https://www.tiktok.com/@fulano/video/7000000000000000000'), t)
    assert.ok(/PRÓXIMOS PASSOS/i.test(t) && t.includes('`.tiktok mp3 https://www.tiktok.com/@fulano/video/7000000000000000000`'), t)
    assert.ok(t.length <= 1024)
})

teste('formatMediaCaption de áudio sugere o vídeo; de imagem não inventa próximos passos', () => {
    const a = formatMediaCaption({
        platform: 'YouTube', title: 'Numb', author: 'Linkin Park', isAudio: true,
        url: 'https://www.youtube.com/watch?v=abc', filePath: '/tmp/a.mp3', fileProbe: probeAudio
    })
    assert.ok(a.includes('*Tipo:* Áudio') && a.includes('`.play mp4 Numb`'), a)
    const img = formatMediaCaption({ platform: 'Pinterest', title: 'Foto', isImage: true, url: 'https://pin.it/abc', filePath: '/tmp/a.jpg' })
    assert.ok(!/PRÓXIMOS PASSOS/i.test(img), img)
})

teste('título e link enormes: continua dentro de 1024 e perde primeiro o link, depois os próximos passos', () => {
    const t = formatMediaCaption({
        platform: 'TikTok', title: 'T'.repeat(300), author: 'A'.repeat(200), uploadDate: '20261001',
        url: 'https://www.tiktok.com/@fulano/video/7000000000000000000?' + 'q'.repeat(400),
        filePath: '/tmp/x.mp4', fileProbe: probeVideo
    })
    assert.ok(t.length <= 1024, `${t.length} caracteres`)
    assert.ok(/Plataforma/.test(t) && /Tipo/.test(t), 'perdeu origem ou tipo antes do link')
})

console.log(`\n📊 Ficha completa: ✅ ${ok}  ❌ ${falhou}\n`)
process.exit(falhou > 0 ? 1 : 0)
