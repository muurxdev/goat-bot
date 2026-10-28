process.env.NODE_ENV = 'test'

/**
 * Qualidade e ficha da mídia entregue (2026-09-17).
 *
 * Cobre o que o dono pediu: a legenda tem de dizer QUANDO o vídeo foi postado,
 * com que CÓDIGO e QUANTO TEMPO levou até chegar; e a música tem de sair com a
 * capa do álbum embutida mesmo quando o download não passa pelo yt-dlp.
 */

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const http = require('http')
const { spawnSync } = require('child_process')

const {
    extrairCodigo,
    formatMediaCaption,
    parseMediaDateAndYear
} = require('../src/services/media/formatResolver')
const { embutirCapaETags, temCapaEmbutida } = require('../src/services/media/artworkEmbedder')
const { molduraQuebrada } = require('./helpers/moldura')
const legendaPlay = require('../src/commands/media/play')

let ok = 0, falhou = 0
function teste(nome, fn) {
    return Promise.resolve()
        .then(fn)
        .then(() => { ok++; console.log(`  ✅ PASS: ${nome}`) })
        .catch(err => { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) })
}

const temFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0

async function main() {
    console.log('\n🧪 Qualidade e ficha da mídia...\n')

    // ── Código do post ────────────────────────────────────────────────
    await teste('código sai do link do YouTube em todas as formas', () => {
        assert.strictEqual(extrairCodigo('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
        assert.strictEqual(extrairCodigo('https://youtu.be/dQw4w9WgXcQ?t=30'), 'dQw4w9WgXcQ')
        assert.strictEqual(extrairCodigo('https://www.youtube.com/shorts/abc-123_XYZ'), 'abc-123_XYZ')
        assert.strictEqual(extrairCodigo('https://www.youtube.com/watch?list=RD&v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ')
    })

    await teste('código sai dos links das outras redes', () => {
        assert.strictEqual(extrairCodigo('https://www.tiktok.com/@user/video/7312345678901234567'), '7312345678901234567')
        assert.strictEqual(extrairCodigo('https://www.instagram.com/reel/C1a2b3c4d5e/'), 'C1a2b3c4d5e')
        assert.strictEqual(extrairCodigo('https://x.com/user/status/1745678901234567890'), '1745678901234567890')
        assert.strictEqual(extrairCodigo('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'), '4cOdK2wGLETKBW3PvgPWqT')
    })

    await teste('id conhecido tem prioridade; link sem código devolve nada', () => {
        assert.strictEqual(extrairCodigo('https://youtu.be/dQw4w9WgXcQ', 'ID_REAL'), 'ID_REAL')
        assert.strictEqual(extrairCodigo('https://exemplo.com/algo.mp4'), null)
        assert.strictEqual(extrairCodigo(''), null)
        assert.strictEqual(extrairCodigo('https://youtu.be/dQw4w9WgXcQ', 'undefined'), 'dQw4w9WgXcQ')
    })

    // ── Legenda dos comandos de mídia ─────────────────────────────────
    await teste('legenda mostra data de publicação, fonte e tempo gasto — sem código', () => {
        const legenda = formatMediaCaption({
            title: 'Numb',
            author: 'Linkin Park',
            durationFormatted: '3:07',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            uploadDate: '20240312',
            elapsedMs: 12000,
            isAudio: false
        })
        assert.ok(legenda.includes('📅 *Publicado em:* 12/03/2024'), 'falta a data de publicação')
        assert.ok(legenda.includes('⏬ *Baixado em:* 12s'), 'falta o tempo gasto')
        assert.ok(legenda.includes('👤 *Autor:* Linkin Park') && legenda.includes('⏱️ *Duração:* 3:07'), 'falta autor ou duração')
        assert.ok(legenda.includes('║   🎬 *VÍDEO BAIXADO* 🎬   ║'), 'falta o cabeçalho em caixa')
        assert.ok(legenda.includes('╭━〔 🌐 DETALHES DA MÍDIA 〕━⬣'), 'falta a seção de detalhes')
        // O dono tirou o código do post em 2026-09-20: quem identifica a mídia é
        // o link da fonte, e o espaço foi para os dados reais do arquivo.
        assert.ok(!/Código/i.test(legenda), 'o código do post voltou para a legenda')
        assert.ok(legenda.includes('🔗 *Fonte:* https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'falta o link da fonte')
        assert.strictEqual(molduraQuebrada(legenda), null, legenda)
    })

    await teste('primeiro relatório traz detalhes limpos e encaminha para .mediainfo para dados técnicos', () => {
        const legenda = formatMediaCaption({
            title: 'Numb',
            url: 'https://youtu.be/dQw4w9WgXcQ',
            filePath: '/tmp/numb.mp4',
            fileProbe: {
                container: 'MP4', vcodec: 'h264', acodec: 'aac', bitrateKbps: 192,
                totalBitrateKbps: 3045, fps: 30, sampleRateHz: 48000, channels: 2,
                width: 3840, height: 2160, sizeBytes: 74580000, durationSec: 187,
                isAudio: false, hasVideo: true, tags: {}
            }
        })
        assert.ok(legenda.includes('🎬 *Qualidade:* 4K'), legenda)
        assert.ok(legenda.includes('⏱️ *Duração:* 3:07'), legenda)
        assert.ok(legenda.includes('.mediainfo'), 'falta aviso de .mediainfo para ficha completa')
        const { rotuloTaxa } = require('../src/services/media/formatResolver')
        assert.strictEqual(rotuloTaxa(320), '320 kbps')
        assert.strictEqual(rotuloTaxa(18400), '18,4 Mbps')
        assert.strictEqual(rotuloTaxa(0), null)
    })

    await teste('em áudio e imagem a ficha não repete o formato nem inventa vídeo', () => {
        const audio = formatMediaCaption({
            title: 'Numb', isAudio: true, filePath: '/tmp/numb.mp3',
            fileProbe: {
                container: 'MP3', vcodec: null, acodec: 'mp3', bitrateKbps: 320,
                totalBitrateKbps: 320, sampleRateHz: 44100, channels: 2,
                width: 0, height: 0, sizeBytes: 7500000, durationSec: 187,
                isAudio: true, hasVideo: false, tags: {}
            }
        })
        assert.ok(audio.includes('🎚️ *Qualidade:* 320 kbps'), audio)
        assert.ok(audio.includes('⏱️ *Duração:* 3:07'), audio)
        assert.ok(!/kHz|estéreo/.test(audio), 'kHz/canais voltaram para a ficha de áudio')

        const imagem = formatMediaCaption({
            title: 'Wallpaper', isImage: true, filePath: '/tmp/a.jpg',
            fileProbe: {
                container: 'JPEG', vcodec: 'mjpeg', acodec: null, width: 1600, height: 900,
                sizeBytes: 512000, durationSec: 0, isAudio: false, hasVideo: true, tags: {}
            }
        })
        assert.ok(imagem.includes('📐 *Resolução:* 1600×900 (16:9)'), imagem)
        assert.ok(!/Duração/.test(imagem), 'imagem não tem duração')
        assert.ok(!/JPG \(JPEG\)|JPEG \(JPEG\)/.test(imagem), 'formato repetido na imagem')
    })

    await teste('sem dados, a legenda não inventa linha vazia', () => {
        const legenda = formatMediaCaption({ title: 'Algo', url: 'https://exemplo.com/a.mp4' })
        assert.ok(!/Publicado em/.test(legenda), 'inventou data')
        assert.ok(!/código/.test(legenda), 'inventou código')
        assert.ok(!/Pronto em/.test(legenda), 'inventou tempo')
    })

    await teste('tempo só aparece quando foi medido de verdade', () => {
        for (const ms of [0, null, -5, undefined]) {
            const legenda = formatMediaCaption({ title: 'X', elapsedMs: ms })
            assert.ok(!/Baixado em/.test(legenda), `tempo apareceu com elapsedMs=${ms}`)
        }
        assert.ok(formatMediaCaption({ title: 'X', elapsedMs: 95000 }).includes('*Baixado em:* 1m 35s'))
        // Vindo do cache o total é de milissegundos — "Baixado em 0s" parece defeito.
        assert.ok(formatMediaCaption({ title: 'X', elapsedMs: 300 }).includes('*Baixado em:* 1s'))
    })

    // ── Legenda do .play ──────────────────────────────────────────────
    await teste('.play existe com o schema esperado', () => {
        assert.strictEqual(legendaPlay.name, 'play')
        assert.strictEqual(typeof legendaPlay.execute, 'function')
    })

    await teste('parseMediaDateAndYear entende os formatos que chegam do yt-dlp', () => {
        assert.strictEqual(parseMediaDateAndYear('20240312').formattedDate, '12/03/2024')
        assert.strictEqual(parseMediaDateAndYear('2024-03-12T10:00:00Z').formattedDate, '12/03/2024')
        assert.strictEqual(parseMediaDateAndYear('2019').year, '2019')
        // Como a data vem da página do YouTube em português, sem yt-dlp.
        assert.strictEqual(parseMediaDateAndYear('23 de abr. de 2005').formattedDate, '23/04/2005')
        assert.strictEqual(parseMediaDateAndYear('1 de janeiro de 2020').formattedDate, '01/01/2020')
        assert.strictEqual(parseMediaDateAndYear('5 de dez. de 2024').year, '2024')
        assert.strictEqual(parseMediaDateAndYear(null, null, { date: '2021-05-02' }).formattedDate, '02/05/2021')
    })

    // ── Capa do álbum embutida no MP3 ─────────────────────────────────
    if (!temFfmpeg) {
        console.log('  ⚠️  ffmpeg ausente: pulei os testes de capa embutida')
    } else {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'capa-teste-'))
        const mp3 = path.join(dir, 'faixa.mp3')
        const jpg = path.join(dir, 'capa.jpg')
        spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-b:a', '320k', mp3])
        spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=red:s=320x320:d=1', '-frames:v', '1', jpg])

        // Servidor local no lugar da capa remota — nada de rede externa no teste.
        const servidor = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' })
            res.end(fs.readFileSync(jpg))
        })
        await new Promise(r => servidor.listen(0, '127.0.0.1', r))
        const urlCapa = `http://127.0.0.1:${servidor.address().port}/capa.jpg`

        await teste('MP3 cru começa sem capa embutida', () => {
            assert.ok(fs.existsSync(mp3), 'o mp3 de teste não foi gerado')
            assert.strictEqual(temCapaEmbutida(mp3), false)
        })

        await teste('capa e ficha entram no MP3 sem recodificar o áudio', async () => {
            const antes = fs.statSync(mp3).size
            const feito = await embutirCapaETags(mp3, {
                thumbnail: urlCapa,
                title: 'Numb',
                author: 'Linkin Park',
                year: '2003'
            })
            assert.strictEqual(feito, true, 'a função disse que não embutiu')
            assert.strictEqual(temCapaEmbutida(mp3), true, 'o arquivo continua sem capa')

            const probe = spawnSync('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', mp3], { encoding: 'utf8' })
            const dados = JSON.parse(probe.stdout)
            const tags = dados.format.tags || {}
            assert.strictEqual(tags.artist || tags.ARTIST, 'Linkin Park')
            assert.strictEqual(tags.title || tags.TITLE, 'Numb')
            const audio = dados.streams.find(s => s.codec_type === 'audio')
            assert.ok(Number(audio.bit_rate) >= 300000, `bitrate caiu para ${audio.bit_rate}`)
            assert.ok(fs.statSync(mp3).size >= antes, 'o arquivo encolheu — sinal de recodificação')
        })

        await teste('arquivo que já tem capa não é mexido de novo', async () => {
            const feito = await embutirCapaETags(mp3, { thumbnail: urlCapa, title: 'Numb' })
            assert.strictEqual(feito, false)
        })

        await teste('capa inacessível não derruba a entrega', async () => {
            const outro = path.join(dir, 'outra.mp3')
            fs.copyFileSync(path.join(dir, 'faixa.mp3'), outro)
            const feito = await embutirCapaETags(outro, { thumbnail: 'http://127.0.0.1:1/naoexiste.jpg', title: 'X' })
            assert.strictEqual(feito, false)
            assert.ok(fs.existsSync(outro), 'o áudio sumiu por causa da capa')
        })

        await teste('sem capa para embutir, devolve falso sem tentar nada', async () => {
            assert.strictEqual(await embutirCapaETags(mp3, {}), false)
            assert.strictEqual(await embutirCapaETags('/tmp/nao-existe-mesmo.mp3', { thumbnail: urlCapa }), false)
        })

        servidor.close()
        fs.rmSync(dir, { recursive: true, force: true })
    }

    // ── Arquivo de cookies em formato aceitável ───────────────────────
    await teste('lixo colado no cabeçalho do cookie é removido', () => {
        const { sanitizarCookies } = require('../src/services/media/mediaArgs')
        const sujo = 'global # Netscape HTTP Cookie File\n# comentário\n.youtube.com\tTRUE\t/\tFALSE\t1823134540\tHSID\tABC123\n'
        const limpo = sanitizarCookies(sujo)
        assert.ok(limpo.startsWith('# Netscape HTTP Cookie File'), `cabeçalho continua quebrado: ${limpo.slice(0, 40)}`)
        assert.ok(limpo.includes('.youtube.com\tTRUE\t/\tFALSE\t1823134540\tHSID\tABC123'), 'perdeu o cookie')
    })

    await teste('cookie sem cabeçalho nenhum ganha um', () => {
        const { sanitizarCookies } = require('../src/services/media/mediaArgs')
        const limpo = sanitizarCookies('.youtube.com\tTRUE\t/\tFALSE\t1823134540\tSAPISID\tXYZ\n')
        assert.ok(limpo.startsWith('# Netscape HTTP Cookie File'))
        assert.ok(limpo.includes('SAPISID'))
    })

    await teste('linhas quebradas somem, cookies válidos ficam', () => {
        const { sanitizarCookies } = require('../src/services/media/mediaArgs')
        const limpo = sanitizarCookies('# Netscape HTTP Cookie File\nisto não é cookie\n\n.youtube.com\tTRUE\t/\tFALSE\t1\tLOGIN_INFO\tV\r\n')
        const linhas = limpo.trim().split('\n')
        assert.strictEqual(linhas.length, 2, `sobrou linha inválida: ${JSON.stringify(linhas)}`)
        assert.ok(linhas[1].includes('LOGIN_INFO'))
        assert.ok(!/\r/.test(limpo), 'sobrou quebra de linha do Windows')
    })

    // ── Bitrate máximo no caminho reserva ─────────────────────────────
    await teste('o caminho reserva pede áudio em 320 kbps', () => {
        const fonte = fs.readFileSync(path.join(__dirname, '..', 'src', 'services', 'media', 'youtubeFallback.js'), 'utf8')
        assert.ok(/audioBitrate:\s*"320"/.test(fonte), 'o cobalt voltou a pedir o bitrate padrão (128 kbps)')
    })

    // ── Aviso com miniatura, capa do áudio e playlist (2026-09-18) ──────
    await teste('aviso de download sai em moldura com título, autor e duração', () => {
        const { legendaDoAviso } = require('../src/services/media/avisoDownload')
        const t = legendaDoAviso({ isAudio: false, plataforma: 'YouTube', previa: { title: 'Numb', author: 'Linkin Park', durationFormatted: '3:07' } })
        assert.strictEqual(molduraQuebrada(t), null, t)
        assert.ok(t.includes('BAIXANDO O VÍDEO') && t.includes('*Título:* Numb') && t.includes('*Duração:* 3:07'), t)
        const vazio = legendaDoAviso({ isAudio: true, previa: { durationFormatted: '—' } })
        assert.ok(!vazio.includes('Duração'), 'duração "—" não pode virar linha')
    })

    // 2026-10-15: o aviso é a reação ⏳ + UMA frase: "⏳ Baixando vídeo do TikTok…".
    // Sem cartão, sem foto e sem nome da mídia (o nome vem na ficha que chega com ela).
    await teste('aviso: reação ⏳ e a frase "Baixando vídeo do <plataforma>…"', async () => {
        const { avisarDownload } = require('../src/services/media/avisoDownload')
        const enviados = []
        const respostas = []
        await avisarDownload({
            client: { sendMessage: async (_jid, conteudo) => { enviados.push(conteudo) } },
            from: 'x@g.us', info: { key: { id: 'AV1', remoteJid: 'x@g.us' } },
            reply: async t => { respostas.push(t) },
            meta: { title: 'Numb' }, url: 'https://vimeo.com/1', tipo: 'vídeo'
        })
        assert.strictEqual(enviados.length, 1)
        assert.strictEqual(enviados[0].react?.text, '⏳', 'faltou a reação de espera')
        assert.deepStrictEqual(respostas, ['⏳ Baixando vídeo do Vimeo…'])
        assert.ok(!/Numb/.test(respostas[0]), 'o nome da mídia voltou para o aviso')
        assert.ok(!/╔|╭━〔/.test(respostas[0]), 'o aviso voltou a ser cartão em moldura')
    })

    await teste('aviso de áudio por link e por nome dizem "Baixando áudio do …"', async () => {
        const { avisarDownload, avisarBusca } = require('../src/services/media/avisoDownload')
        const respostas = []
        const reply = async t => { respostas.push(t) }
        await avisarDownload({ reply, meta: { title: 'Faded' }, isAudio: true, tipo: 'áudio', plataforma: 'SoundCloud' })
        await avisarBusca({ reply, tipo: 'áudio' })
        await avisarBusca({ reply, tipo: 'vídeo', plataforma: 'YouTube' })
        await avisarBusca({ reply }) // o comando não sabe o tipo: a frase sai sem ele
        assert.deepStrictEqual(respostas, [
            '⏳ Baixando áudio do SoundCloud…',
            '⏳ Baixando áudio do YouTube…',
            '⏳ Baixando vídeo do YouTube…',
            '⏳ Baixando do YouTube…'
        ])
    })

    await teste('um pedido recebe um aviso só (busca por nome + dados do vídeo)', async () => {
        const { avisarDownload, avisarBusca } = require('../src/services/media/avisoDownload')
        const respostas = []
        const reply = async t => { respostas.push(t) }
        const info = { key: { id: 'DEDUPE1', remoteJid: 'y@g.us' } }
        await avisarBusca({ from: 'y@g.us', info, reply, tipo: 'vídeo' })
        await avisarDownload({ from: 'y@g.us', info, reply, url: 'https://www.youtube.com/watch?v=x', tipo: 'vídeo', plataforma: 'YouTube' })
        assert.strictEqual(respostas.length, 1, `avisou ${respostas.length} vezes: ${JSON.stringify(respostas)}`)
        // Outro pedido (outra mensagem) volta a avisar.
        await avisarBusca({ from: 'y@g.us', info: { key: { id: 'DEDUPE2', remoteJid: 'y@g.us' } }, reply, tipo: 'vídeo' })
        assert.strictEqual(respostas.length, 2)
    })

    await teste('pesquisa que só lista opções continua dizendo "Pesquisando <termo>"', async () => {
        const { avisarPesquisa } = require('../src/services/media/avisoDownload')
        const respostas = []
        await avisarPesquisa({ reply: async t => { respostas.push(t) }, termo: 'Evidências' })
        assert.deepStrictEqual(respostas, ['🔎 Pesquisando *Evidências* no YouTube…'])
    })

    // 2026-10-15: o dono pediu a ficha de volta. Ela vai na legenda da PRÓPRIA mídia (uma mensagem só).
    await teste('vídeo chega com a ficha na legenda, numa mensagem só', async () => {
        const fsp = require('fs')
        const { enviarVideo } = require('../src/services/media/videoSender')
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-com-ficha-'))
        const arq = path.join(dir, 'v.mp4')
        fsp.writeFileSync(arq, Buffer.alloc(4096))
        const enviados = []
        try {
            await enviarVideo({
                client: { sendMessage: async (_j, c) => { enviados.push(c); return { key: {} } } },
                from: 'x@g.us', info: { key: { id: 'M1' } }, filePath: arq, fileName: 'v.mp4',
                caption: '╔══╗ FICHA DO ARQUIVO…'
            })
            const midias = enviados.filter(m => m.video || m.document)
            assert.strictEqual(midias.length, 1, 'mais de uma mídia por pedido')
            assert.ok(/FICHA/.test(String(midias[0].caption || '')), 'a ficha não está na legenda do vídeo')
            assert.strictEqual(enviados.filter(m => m.text).length, 0, 'mandou texto solto além da mídia')
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
        }
    })

    await teste('ficha longa nunca passa de 1024 caracteres e a nota do arquivo fica inteira', async () => {
        const fsp = require('fs')
        const { enviarVideo } = require('../src/services/media/videoSender')
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-ficha-longa-'))
        const arq = path.join(dir, 'v.mkv')
        fsp.writeFileSync(arq, Buffer.alloc(4096))
        const enviados = []
        try {
            await enviarVideo({
                client: { sendMessage: async (_j, c) => { enviados.push(c); return { key: {} } } },
                from: 'x@g.us', info: { key: { id: 'M1' } }, filePath: arq, fileName: 'v.mkv',
                caption: 'FICHA '.repeat(400)
            })
            const doc = enviados.find(m => m.document)
            assert.ok(doc, 'o MKV devia sair como documento')
            assert.ok(doc.caption.length <= 1024, `legenda com ${doc.caption.length} caracteres`)
            assert.ok(/Mandei como arquivo/.test(doc.caption), 'a nota do arquivo foi cortada')
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
        }
    })

    await teste('sem cliente, o aviso não faz nada e não derruba o download', async () => {
        const { avisarDownload } = require('../src/services/media/avisoDownload')
        assert.strictEqual(await avisarDownload({ reply: async () => { throw new Error('não devia responder') } }), false)
    })

    await teste('legenda da mídia diz a plataforma, o tipo e como abrir a ficha completa', () => {
        const t = formatMediaCaption({ platform: 'Vimeo', title: 'Clipe', isAudio: false })
        assert.ok(t.includes('*Plataforma:* Vimeo') && t.includes('*Tipo:* Vídeo'), t)
        assert.ok(/\.mediainfo/.test(t), 'faltou a dica do .mediainfo')
        assert.strictEqual(molduraQuebrada(t), null, t)
    })

    await teste('link de música dentro de lista ou mix é UMA música, não a playlist', () => {
        const { ehPlaylistDoYouTube } = require('../src/services/audioStreamService')
        assert.strictEqual(ehPlaylistDoYouTube('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1'), false)
        assert.strictEqual(ehPlaylistDoYouTube('https://youtu.be/dQw4w9WgXcQ?list=PLabc'), false)
        assert.strictEqual(ehPlaylistDoYouTube('https://www.youtube.com/playlist?list=PLabc'), true)
        assert.strictEqual(ehPlaylistDoYouTube('https://music.youtube.com/playlist?list=OLAK5uy_x'), true)
        assert.strictEqual(ehPlaylistDoYouTube('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), false)
    })

    // Áudio (2026-10-15, pedido do dono): capa + informações + player do áudio na MESMA mensagem.
    // Padrão = prévia (externalAdReply com a capa em bytes, leve); sem kHz nem canais.
    const capaFalsa = await require('sharp')({ create: { width: 1280, height: 720, channels: 3, background: '#aa3300' } }).jpeg().toBuffer()
    const urlSeguro = require('../src/services/media/urlSeguro')
    const buscarOriginal = urlSeguro.buscarComSeguranca
    const urlsBuscadas = []
    urlSeguro.buscarComSeguranca = async (u) => { urlsBuscadas.push(String(u)); return { resposta: new Response(capaFalsa, { status: 200 }), destino: 'x', saltos: 0 } }

    // O padrão é "capa" (imagem com legenda + áudio): a prévia dentro do áudio era descartada pelo
    // WhatsApp do dono sem erro nenhum. Estes testes cobrem a prévia como modo opcional.
    await teste('padrão: a capa com as informações vai como imagem de legenda e o áudio chega liso logo abaixo', async () => {
        delete process.env.AUDIO_NUMA_MENSAGEM
        const fsp = require('fs')
        const { enviarAudio } = require('../src/services/media/audioSender')
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-capa-'))
        const arq = path.join(dir, 'faixa.mp3')
        fsp.writeFileSync(arq, Buffer.alloc(2048))
        const enviados = []
        try {
            const r = await enviarAudio({
                client: { sendMessage: async (_jid, conteudo) => { enviados.push(conteudo); return { key: {} } } },
                from: 'x@g.us', info: { key: { id: 'M1' } }, filePath: arq, fileName: 'faixa.mp3',
                caption: '🎵 *Numb*\nArtista: Linkin Park\nArquivo: MP3 · 320 kbps · 3,5 MB',
                thumbnail: 'https://i.ytimg.com/vi/x/maxresdefault.jpg', title: 'Numb', author: 'Linkin Park'
            })
            assert.strictEqual(r.modo, 'audio-capa')
            const msgs = enviados.filter(m => !m.react)
            assert.strictEqual(msgs.length, 2, 'mandou ' + msgs.length + ' mensagens')
            assert.ok(msgs[0].image && Buffer.isBuffer(msgs[0].image), 'a primeira devia ser a capa (imagem)')
            assert.ok(/Linkin Park/.test(msgs[0].caption) && /320 kbps/.test(msgs[0].caption), msgs[0].caption)
            assert.ok(!/kHz|estéreo/.test(msgs[0].caption))
            assert.ok(msgs[1].audio && !msgs[1].contextInfo, 'a segunda devia ser o áudio liso (sem prévia que o WhatsApp descarta)')
            assert.ok(enviados.some(m => m.react?.text === '✅'), 'faltou a reação de pronto')
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
        }
    })

    await teste('modo documento: arquivo com a capa na miniatura e as informações na legenda, numa mensagem', async () => {
        process.env.AUDIO_NUMA_MENSAGEM = 'documento'
        const fsp = require('fs')
        const { enviarAudio } = require('../src/services/media/audioSender')
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-doc-'))
        const arq = path.join(dir, 'faixa.mp3')
        fsp.writeFileSync(arq, Buffer.alloc(2048))
        const enviados = []
        try {
            const r = await enviarAudio({
                client: { sendMessage: async (_jid, c) => { enviados.push(c); return { key: {} } } },
                from: 'x@g.us', filePath: arq, fileName: 'faixa.mp3', caption: 'FICHA', title: 'Numb', author: 'X'
            })
            assert.strictEqual(r.modo, 'audio-documento')
            const msgs = enviados.filter(m => !m.react)
            assert.strictEqual(msgs.length, 1)
            assert.ok(msgs[0].document && msgs[0].caption === 'FICHA' && Buffer.isBuffer(msgs[0].jpegThumbnail))
        } finally {
            delete process.env.AUDIO_NUMA_MENSAGEM
            fs.rmSync(dir, { recursive: true, force: true })
        }
    })

    process.env.AUDIO_NUMA_MENSAGEM = 'previa'

    await teste('áudio: capa, informações e o áudio vão numa mensagem só (prévia), sem texto solto', async () => {
        const fsp = require('fs')
        const { enviarAudio } = require('../src/services/media/audioSender')
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-envio-'))
        const arq = path.join(dir, 'faixa.mp3')
        fsp.writeFileSync(arq, Buffer.alloc(2048))
        const enviados = []
        try {
            const r = await enviarAudio({
                client: { sendMessage: async (_jid, conteudo) => { enviados.push(conteudo); return { key: {} } } },
                from: 'x@g.us', info: { key: { id: 'M1' } }, filePath: arq, fileName: 'faixa.mp3', caption: 'ficha longa que NÃO deve sair como texto',
                thumbnail: 'https://i.ytimg.com/vi/x/maxresdefault.jpg', title: 'Numb', author: 'Linkin Park - Topic'
            })
            assert.strictEqual(r.modo, 'audio')
            const mensagens = enviados.filter(m => !m.react)
            assert.strictEqual(mensagens.length, 1, 'mandou ' + mensagens.length + ' mensagens: ' + JSON.stringify(mensagens.map(m => Object.keys(m))))
            assert.ok(mensagens[0].audio, 'a mensagem devia ser o áudio')
            const previa = mensagens[0].contextInfo.externalAdReply
            assert.strictEqual(previa.title, 'Numb')
            assert.ok(Buffer.isBuffer(previa.thumbnail) && previa.thumbnail.length > 500, 'a capa não foi como imagem')
            assert.ok(previa.thumbnail.length <= 60 * 1024, 'capa com ' + previa.thumbnail.length + ' bytes: pesada demais para ir dentro da mensagem')
            assert.ok(!previa.thumbnailUrl, 'voltou a mandar só o link da capa (vira ícone de microfone)')
            const meta = await require('sharp')(previa.thumbnail).metadata()
            assert.ok(Math.max(meta.width, meta.height) <= 400, 'capa com ' + meta.width + 'x' + meta.height)
            assert.ok(previa.body.includes('Linkin Park') && !/Topic/.test(previa.body), previa.body)
            assert.ok(previa.renderLargerThumbnail === true, 'capa pequena: devia ser a prévia grande')
            assert.ok(enviados.some(m => m.react?.text === '✅'), 'faltou a reação de pronto')
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
        }
    })

    await teste('foto genérica de banco de imagens não vira capa do áudio (usa a gerada)', async () => {
        const fsp = require('fs')
        const { enviarAudio } = require('../src/services/media/audioSender')
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-generico-'))
        const arq = path.join(dir, 'faixa.mp3')
        fsp.writeFileSync(arq, Buffer.alloc(2048))
        const enviados = []
        urlsBuscadas.length = 0
        try {
            await enviarAudio({
                client: { sendMessage: async (_jid, conteudo) => { enviados.push(conteudo); return { key: {} } } },
                from: 'x@g.us', filePath: arq, fileName: 'faixa.mp3', caption: 'ficha',
                thumbnail: 'https://images.unsplash.com/photo-1611605698335?w=600', title: 'Numb', author: 'X'
            })
            const audio = enviados.find(m => m.audio)
            assert.ok(audio, 'o áudio não saiu')
            assert.ok(!urlsBuscadas.some(u => /unsplash/.test(u)), 'baixou a foto genérica do banco de imagens')
            assert.ok(Buffer.isBuffer(audio.contextInfo?.externalAdReply?.thumbnail), 'ficou sem capa (devia usar a gerada)')
        } finally {
            fs.rmSync(dir, { recursive: true, force: true })
        }
    })

    await teste('AUDIO_NUMA_MENSAGEM=off: ficha em texto e o áudio liso depois (duas mensagens, sem prévia)', async () => {
        process.env.AUDIO_NUMA_MENSAGEM = 'off'
        const fsp = require('fs')
        const { enviarAudio } = require('../src/services/media/audioSender')
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-off-'))
        const arq = path.join(dir, 'faixa.mp3')
        fsp.writeFileSync(arq, Buffer.alloc(2048))
        const enviados = []
        try {
            await enviarAudio({
                client: { sendMessage: async (_jid, c) => { enviados.push(c); return { key: {} } } },
                from: 'x@g.us', filePath: arq, fileName: 'faixa.mp3', caption: 'ficha', title: 'Numb', author: 'X'
            })
            const msgs = enviados.filter(m => !m.react)
            assert.strictEqual(msgs.length, 2)
            assert.strictEqual(msgs[0].text, 'ficha')
            assert.ok(msgs[1].audio && !msgs[1].contextInfo, 'o áudio devia sair liso')
        } finally {
            delete process.env.AUDIO_NUMA_MENSAGEM
            fs.rmSync(dir, { recursive: true, force: true })
        }
    })

    if (temFfmpeg) {
        await teste('áudio real: a informação sai como "MP3 · 320 kbps · tamanho", sem kHz nem canais', async () => {
            process.env.AUDIO_NUMA_MENSAGEM = 'previa'
            const { enviarAudio } = require('../src/services/media/audioSender')
            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-info-'))
            const mp3 = path.join(dir, 'a.mp3')
            spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=d=3', '-c:a', 'libmp3lame', '-b:a', '320k', mp3])
            const enviados = []
            try {
                await enviarAudio({
                    client: { sendMessage: async (_jid, c) => { enviados.push(c); return { key: {} } } },
                    from: 'x@g.us', filePath: mp3, fileName: 'a.mp3', title: 'Clipe', author: 'Artista X',
                    url: 'https://www.youtube.com/watch?v=abc'
                })
                const previa = enviados.find(m => m.audio).contextInfo.externalAdReply
                const linhas = previa.body.split('\n')
                assert.ok(/^Artista X · 0:0\d$/.test(linhas[0]), 'linha 1: ' + linhas[0])
                assert.ok(/^MP3 · 320 kbps · \d+(,\d+)? ?(KB|MB)/.test(linhas[1]), 'linha 2: ' + linhas[1])
                assert.strictEqual(linhas[2], 'YouTube')
                assert.ok(!/kHz|estéreo|mono/i.test(previa.body), 'kHz/canais na prévia: ' + previa.body)
                assert.strictEqual(previa.sourceUrl, 'https://www.youtube.com/watch?v=abc')
            } finally {
                fs.rmSync(dir, { recursive: true, force: true })
            }
        })

        await teste('sem capa da plataforma, a capa sai de um quadro do próprio vídeo', async () => {
            process.env.AUDIO_NUMA_MENSAGEM = 'previa'
            const { enviarAudio } = require('../src/services/media/audioSender')
            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-quadro-'))
            const video = path.join(dir, 'v.mp4')
            const mp3 = path.join(dir, 'a.mp3')
            spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=1080x1920:r=30:d=3', '-f', 'lavfi', '-i', 'sine=d=3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', video])
            spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-vn', '-c:a', 'libmp3lame', '-b:a', '320k', mp3])
            const enviados = []
            try {
                await enviarAudio({
                    client: { sendMessage: async (_jid, c) => { enviados.push(c); return { key: {} } } },
                    from: 'x@g.us', filePath: mp3, fileName: 'a.mp3', videoPath: video, title: 'Clipe'
                })
                const previa = enviados.find(m => m.audio).contextInfo.externalAdReply
                assert.ok(Buffer.isBuffer(previa.thumbnail), 'não tirou capa do vídeo')
                const meta = await require('sharp')(previa.thumbnail).metadata()
                // O quadro é vertical (9:16): a proporção se mantém, só que leve (lado maior até 400 px).
                assert.ok(meta.height <= 400 && Math.abs(meta.width / meta.height - 405 / 720) < 0.03, 'quadro com ' + meta.width + 'x' + meta.height)
                assert.ok(/320 kbps/.test(previa.body), 'resumo sem a taxa real')
            } finally {
                fs.rmSync(dir, { recursive: true, force: true })
            }
        })
    }
    urlSeguro.buscarComSeguranca = buscarOriginal
    delete process.env.AUDIO_NUMA_MENSAGEM

    // 2026-10-15: "a capa, as informações e o áudio tudo junto, numa só". Áudio do WhatsApp não tem
    // legenda, então vai num vídeo de imagem parada (a capa) com a ficha na legenda.
    if (temFfmpeg) {
        const gerarMp3 = (dir, seg = 3) => {
            const mp3 = path.join(dir, 'faixa.mp3')
            const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `sine=frequency=440:duration=${seg}`, '-c:a', 'libmp3lame', '-b:a', '192k', mp3])
            assert.strictEqual(r.status, 0, 'ffmpeg não gerou o mp3 de teste')
            return mp3
        }

        await teste('modo video: capa + ficha + áudio saem numa mensagem só (vídeo com legenda)', async () => {
            process.env.AUDIO_NUMA_MENSAGEM = 'video'
            const { enviarAudio } = require('../src/services/media/audioSender')
            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-uma-msg-'))
            const mp3 = gerarMp3(dir)
            const capa = await require('sharp')({ create: { width: 1280, height: 720, channels: 3, background: '#aa3300' } }).jpeg().toBuffer()
            const capaUrl = path.join(dir, 'capa.jpg')
            fs.writeFileSync(capaUrl, capa)
            const enviados = []
            let sondagem = null
            try {
                await enviarAudio({
                    client: {
                        sendMessage: async (_j, c) => {
                            enviados.push(c)
                            if (c.video) {
                                // O arquivo some depois do envio: conferir aqui, durante.
                                const p = spawnSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', c.video.url], { encoding: 'utf8' })
                                sondagem = JSON.parse(p.stdout || '{}')
                            }
                            return { key: {} }
                        }
                    },
                    from: 'x@g.us', info: { key: { id: 'M1' } }, filePath: mp3, fileName: 'faixa.mp3',
                    caption: '🎵 *FICHA*\nArtista: Teste\nDuração: 0:03', title: 'Numb', author: 'Linkin Park',
                    videoPath: null, thumbnail: null
                })
                const msgs = enviados.filter(m => !m.react)
                assert.strictEqual(msgs.length, 1, `mandou ${msgs.length} mensagens: ${JSON.stringify(msgs.map(m => Object.keys(m)))}`)
                assert.ok(msgs[0].video, 'a mensagem devia ser o vídeo com a capa')
                assert.ok(!msgs[0].audio && !msgs[0].text, 'saiu áudio ou texto solto além da mensagem única')
                assert.ok(/FICHA/.test(msgs[0].caption), 'a ficha não está na legenda')
                assert.ok(msgs[0].caption.length <= 1024)
                const tipos = (sondagem.streams || []).map(s => `${s.codec_type}:${s.codec_name}`)
                assert.ok(tipos.includes('video:h264'), `sem vídeo h264: ${tipos}`)
                assert.ok(tipos.includes('audio:aac'), `sem áudio aac: ${tipos}`)
                assert.ok(enviados.some(m => m.react?.text === '✅'), 'faltou a reação de pronto')
            } finally {
                fs.rmSync(dir, { recursive: true, force: true })
            }
        })

        await teste('modo video: sem capa da plataforma ainda sai com uma capa gerada', async () => {
            process.env.AUDIO_NUMA_MENSAGEM = 'video'
            const { enviarAudio } = require('../src/services/media/audioSender')
            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-sem-capa-'))
            const mp3 = gerarMp3(dir)
            const enviados = []
            try {
                await enviarAudio({
                    client: { sendMessage: async (_j, c) => { enviados.push(c); return { key: {} } } },
                    from: 'x@g.us', filePath: mp3, fileName: 'faixa.mp3', title: 'Música sem capa', author: 'Alguém'
                })
                const v = enviados.find(m => m.video)
                assert.ok(v, 'não saiu o vídeo com capa')
                assert.ok(/Música sem capa/.test(v.caption), `legenda: ${v.caption}`)
            } finally {
                fs.rmSync(dir, { recursive: true, force: true })
            }
        })

        await teste('modo video: se o vídeo com capa não puder ser feito, a ficha e o áudio ainda chegam', async () => {
            process.env.AUDIO_NUMA_MENSAGEM = 'video'
            const { enviarAudio } = require('../src/services/media/audioSender')
            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-fallback-'))
            const falso = path.join(dir, 'faixa.mp3')
            fs.writeFileSync(falso, Buffer.alloc(2048)) // não é áudio: o ffmpeg recusa
            const enviados = []
            try {
                await enviarAudio({
                    client: { sendMessage: async (_j, c) => { enviados.push(c); return { key: {} } } },
                    from: 'x@g.us', filePath: falso, fileName: 'faixa.mp3', caption: 'ficha', title: 'X'
                })
                const msgs = enviados.filter(m => !m.react)
                assert.ok(msgs.some(m => m.text === 'ficha'), 'a ficha não chegou')
                assert.ok(msgs.some(m => m.audio), 'o áudio não chegou')
            } finally {
                fs.rmSync(dir, { recursive: true, force: true })
            }
        })
    }

    delete process.env.AUDIO_NUMA_MENSAGEM

    if (temFfmpeg) {
        const { ensureMobileVideoCompatibility } = require('../src/services/media/mediaProcessor')
        const { probeMedia } = require('../src/services/media/formatResolver')
        const temX265 = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' }).stdout.includes('libx265')

        // O caso real de 2026-09-21: TikTok HEVC de 23 MB virava H.264 de 150 MB
        // (crf 18 sem teto), passava do limite da galeria e ia como documento.
        await teste('HEVC vira H.264 na mesma resolução e fps, sem inflar o arquivo', async () => {
            if (!temX265) { console.log('     (sem libx265 neste ffmpeg: pulado)'); return }
            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'conv-hevc-'))
            const orig = path.join(dir, 'hevc.mp4')
            try {
                spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=1080x1920:r=30:d=6', '-f', 'lavfi', '-i', 'sine=d=6',
                    '-c:v', 'libx265', '-b:v', '2000k', '-tag:v', 'hvc1', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', orig])
                const antes = fs.statSync(orig).size
                const saida = await ensureMobileVideoCompatibility(orig)
                const p = probeMedia(saida)
                assert.strictEqual(p.vcodec, 'h264', `saiu em ${p.vcodec}`)
                assert.strictEqual(`${p.width}x${p.height}`, '1080x1920', 'a resolução mudou')
                assert.strictEqual(p.fps, 30, 'o fps mudou')
                assert.ok(p.sizeBytes <= antes * 2.2, `inflou: ${antes} -> ${p.sizeBytes} bytes`)
            } finally {
                fs.rmSync(dir, { recursive: true, force: true })
            }
        })

        await teste('MP4 H.264 com o índice no fim é reembalado sem recodificar', async () => {
            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'conv-moov-'))
            const orig = path.join(dir, 'fim.mp4')
            try {
                // Sem +faststart o ffmpeg grava o moov depois dos dados.
                spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=640x360:r=30:d=3', '-f', 'lavfi', '-i', 'sine=d=3',
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', orig])
                const antes = fs.statSync(orig).size
                const saida = await ensureMobileVideoCompatibility(orig)
                assert.notStrictEqual(saida, orig, 'o MP4 com índice no fim passou sem reembalar')
                const cab = fs.readFileSync(saida).subarray(0, 64).toString('latin1')
                assert.ok(cab.indexOf('moov') > -1 && (cab.indexOf('mdat') === -1 || cab.indexOf('moov') < cab.indexOf('mdat')), 'o índice não foi para o começo')
                assert.ok(Math.abs(fs.statSync(saida).size - antes) < antes * 0.05, 'mudou de tamanho: recodificou em vez de só reembalar')
            } finally {
                fs.rmSync(dir, { recursive: true, force: true })
            }
        })
    }

    await teste('TikTok fica com a versão HD e a capa grande', () => {
        const fonte = fs.readFileSync(path.join(__dirname, '..', 'src', 'services', 'media', 'providers', 'tiktok.js'), 'utf8')
        assert.ok(!/await preferirH264\(/.test(fonte), 'voltou a trocar o hdplay pela versão menor em H.264')
        assert.ok(!/thumbnail: data\.cover \|\| data\.origin_cover/.test(fonte), 'voltou a preferir a capa pequena')
    })

    await teste('caminho reserva do YouTube pede 4K antes de 1080p (até o teto do servidor)', () => {
        const fonte = fs.readFileSync(path.join(__dirname, '..', 'src', 'services', 'media', 'youtubeFallback.js'), 'utf8')
        const m = fonte.match(/LOADER_TO_VIDEO = \[\s*\["([^"]+)",\s*(\d+)\]/)
        assert.ok(m, 'sumiu a lista de resoluções do loader.to')
        assert.strictEqual(m[1], '4k', `a primeira resolução da lista é ${m[1]}`)
        assert.strictEqual(m[2], '2160')
        // O teto vem do servidor (1080p em VPS de até 2 núcleos): 4K lá nunca fica pronto a tempo.
        assert.ok(/MEDIA_LIMITS\.MAX_VIDEO_HEIGHT/.test(fonte), 'a lista não respeita o teto de resolução do servidor')
        assert.ok(!/youtubeVideoCodec: "h264"/.test(fonte), 'o cobalt voltou a travar em H.264 (máx. 1080p)')
    })

    await teste('rótulo de qualidade vai até 8K', () => {
        const { qualityLabel } = require('../src/services/media/formatResolver')
        assert.strictEqual(qualityLabel(4320, 7680), '8K')
        assert.strictEqual(qualityLabel(7680, 4320), '8K')
        assert.strictEqual(qualityLabel(2160, 3840), '4K')
        assert.strictEqual(qualityLabel(1440, 2560), '2K')
    })

    await teste('cache de download muda de versão quando a regra de qualidade muda', () => {
        const fonte = fs.readFileSync(path.join(__dirname, '..', 'src', 'services', 'media', 'mediaCacheService.js'), 'utf8')
        assert.ok(/VERSAO_QUALIDADE/.test(fonte), 'sem versão no cache: arquivo antigo (1080p) volta para o mesmo link')
    })

    console.log(`\n📊 Qualidade da mídia: ✅ ${ok}  ❌ ${falhou}\n`)
    process.exit(falhou > 0 ? 1 : 0)
}

main()
