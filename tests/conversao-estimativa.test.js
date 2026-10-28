process.env.NODE_ENV = 'test'

/**
 * Vídeo nunca pode deixar o pedido preso (2026-10-15).
 *
 * Um AV1 4K de 4 min, pedido numa VPS de 1 vCPU, ficou 8 min só com o ⏳ porque o bot tentava
 * converter para H.264 (estimativa: ~35 min). Agora:
 *  - servidor pequeno pede no máximo 1080p (que já é H.264 e dispensa a conversão);
 *  - conversão estimada acima do teto não começa: o original sai na hora;
 *  - o aviso diz a plataforma pelo HOST do link.
 */

const assert = require('assert')

let ok = 0, falhou = 0
function teste(nome, fn) {
    try { fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

function limitesCom(env) {
    const antes = {}
    for (const k of Object.keys(env)) { antes[k] = process.env[k]; process.env[k] = env[k] }
    for (const id of Object.keys(require.cache)) if (/services[\\/]media[\\/]constants\.js$/.test(id)) delete require.cache[id]
    try { return { ...require('../src/services/media/constants').MEDIA_LIMITS } } finally {
        for (const k of Object.keys(env)) { if (antes[k] === undefined) delete process.env[k]; else process.env[k] = antes[k] }
        for (const id of Object.keys(require.cache)) if (/services[\\/]media[\\/]constants\.js$/.test(id)) delete require.cache[id]
    }
}

console.log('\n🧪 Vídeo não prende o pedido...\n')

const { estimarConversaoSeg } = require('../src/services/media/mediaProcessor')

teste('AV1 4K de 4 min em 1 núcleo: estimativa passa de 20 min (o caso que travou)', () => {
    const s = estimarConversaoSeg({ largura: 3840, altura: 2160, fps: 24, duracao: 260, vcodec: 'av1' }, 1)
    assert.ok(s > 20 * 60, `estimou só ${s} s`)
})

teste('TikTok/Reels 1080×1920 HEVC de 60 s converte dentro do teto', () => {
    const s = estimarConversaoSeg({ largura: 1080, altura: 1920, fps: 30, duracao: 60, vcodec: 'hevc' }, 1)
    assert.ok(s > 0 && s <= 300, `estimou ${s} s`)
})

teste('1440p VP9 de 4 min em 1 núcleo passa do teto de 5 min', () => {
    const s = estimarConversaoSeg({ largura: 2560, altura: 1440, fps: 30, duracao: 240, vcodec: 'vp9' }, 1)
    assert.ok(s > 300, `estimou só ${s} s`)
})

teste('mais núcleos, estimativa menor', () => {
    const m = { largura: 1920, altura: 1080, fps: 30, duracao: 300, vcodec: 'vp9' }
    assert.ok(estimarConversaoSeg(m, 4) < estimarConversaoSeg(m, 1))
})

teste('sem dados do vídeo não estima (0) e não bloqueia conversão por engano', () => {
    assert.strictEqual(estimarConversaoSeg({ largura: 0, altura: 0, fps: 0, duracao: 0 }, 1), 0)
    assert.strictEqual(estimarConversaoSeg(null, 1), 0)
})

teste('servidor de 1 a 2 núcleos pede no máximo 1080p; o teto é configurável', () => {
    assert.ok(require('../src/services/media/constants').MEDIA_LIMITS.CPU_CORES >= 1)
    assert.strictEqual(limitesCom({ MEDIA_MAX_VIDEO_HEIGHT: '1440' }).MAX_VIDEO_HEIGHT, 1440)
    assert.strictEqual(limitesCom({ MEDIA_MAX_VIDEO_HEIGHT: '2160' }).MAX_VIDEO_HEIGHT, 2160)
    const padrao = limitesCom({ MEDIA_MAX_VIDEO_HEIGHT: '' })
    assert.strictEqual(padrao.MAX_VIDEO_HEIGHT, padrao.CPU_CORES <= 2 ? 1080 : 2160)
})

teste('yt-dlp: com teto de 1080p a ordenação prefere "res:1080"', () => {
    const { resolveDownloadFormat } = require('../src/services/media/formatResolver')
    const { MEDIA_LIMITS } = require('../src/services/media/constants')
    const r = resolveDownloadFormat({ format: 'mp4', quality: 'best' })
    const ordem = r.args[r.args.indexOf('-S') + 1]
    if (MEDIA_LIMITS.MAX_VIDEO_HEIGHT < 2160) assert.ok(ordem.startsWith(`res:${MEDIA_LIMITS.MAX_VIDEO_HEIGHT},`), ordem)
    else assert.ok(ordem.startsWith('res,'), ordem)
})

async function avisoPelaPlataforma() {
    try {
        const { avisarDownload } = require('../src/services/media/avisoDownload')
        const respostas = []
        const reply = async t => { respostas.push(t) }
        await avisarDownload({ reply, url: 'https://www.youtube.com/watch?v=x', plataforma: 'youtube', tipo: 'vídeo' })
        await avisarDownload({ reply, url: 'https://vm.tiktok.com/abc/', plataforma: 'Instagram', tipo: 'vídeo' })
        await avisarDownload({ reply, plataforma: 'youtube', isAudio: true })
        assert.deepStrictEqual(respostas, [
            '⏳ Baixando vídeo do YouTube…',
            '⏳ Baixando vídeo do TikTok…',
            '⏳ Baixando áudio do YouTube…'
        ])
        ok++; console.log('  ✅ PASS: aviso: a plataforma vem do HOST do link, mesmo que o extrator diga outra grafia')
    } catch (err) {
        falhou++; console.log(`  ❌ FAIL: aviso pela plataforma
     ${err.message}`)
    }
}

avisoPelaPlataforma().then(() => {
    console.log(`
📊 Vídeo não prende o pedido: ✅ ${ok}  ❌ ${falhou}
`)
    process.exit(falhou > 0 ? 1 : 0)
})
