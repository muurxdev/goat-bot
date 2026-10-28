/**
 * Format & Quality Resolver
 * Mapeia formatos (MP3, M4A, MP4) e resoluções para argumentos otimizados do yt-dlp e FFmpeg
 */

const path = require('path')
const { FORMATS, QUALITIES } = require('./constants')
const { formatarTamanho, emMb } = require('../../utils/tamanho')
const M = require('../../utils/moldura')
const logger = require('../../core/logger')

/**
 * Retorna os argumentos de formato e pós-processamento para o yt-dlp
 * @param {object} options
 * @param {string} options.format - 'mp3', 'm4a', 'mp4'
 * @param {string} options.quality - '1080p', '720p', '480p', '360p', 'best'
 * @returns {{ args: Array<string>, targetExt: string, mimeType: string }}
 */
function resolveDownloadFormat({ format = FORMATS.MP3, quality = QUALITIES.BEST } = {}) {
    const fmt = (format || FORMATS.MP3).toLowerCase()
    const qual = (quality || QUALITIES.BEST).toLowerCase()

    if (fmt === FORMATS.MP3) {
        return {
            args: [
                '-f', 'bestaudio/best',
                // Ordena a escolha pela MAIOR taxa de bits e amostragem.
                // Sem isto, "bestaudio" às vezes pegava uma faixa de bitrate menor.
                '-S', 'abr,asr,acodec',
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', '320K',
                '--postprocessor-args', 'FFmpegExtractAudio:-c:a libmp3lame -b:a 320k -q:a 0',
                '--embed-thumbnail',
                '--add-metadata'
            ],
            targetExt: 'mp3',
            mimeType: 'audio/mpeg'
        }
    }

    if (fmt === FORMATS.M4A) {
        return {
            args: [
                '-f', 'ba[ext=m4a]/ba/best',
                '-S', 'abr,asr',
                '-x',
                '--audio-format', 'm4a',
                '--embed-thumbnail',
                '--add-metadata'
            ],
            targetExt: 'm4a',
            mimeType: 'audio/mp4'
        }
    }

    // Formato de Vídeo — MAIOR resolução possível.
    // NÃO forçamos [ext=mp4] no seletor: no YouTube o mp4/h264 trava em 1080p
    // (acima disso é vp9/av1 em webm). Pegamos o melhor vídeo+áudio de qualquer
    // codec; quem cuida de tocar no celular é o mediaProcessor, no fim.
    //
    // MAX: nem o desempate por codec. Serve para destino fora da galeria
    // (Google Drive), onde o arquivo original é entregue como está.
    if (qual === QUALITIES.MAX) {
        return {
            args: [
                '-f', 'bv*+ba/b',
                '-S', 'res,fps,vcodec,acodec,abr',
                '--merge-output-format', 'mp4/mkv',
                '--embed-thumbnail',
                '--add-metadata'
            ],
            targetExt: 'mp4',
            mimeType: 'video/mp4'
        }
    }

    let heightFilter = ''
    if (qual === QUALITIES.P1080) heightFilter = '[height<=1080]'
    else if (qual === QUALITIES.P720) heightFilter = '[height<=720]'
    else if (qual === QUALITIES.P480) heightFilter = '[height<=480]'
    else if (qual === QUALITIES.P360) heightFilter = '[height<=360]'
    // 'best' (default) = sem teto de altura → maior resolução disponível

    // Com teto de altura, o fallback sem teto garante que algo seja baixado.
    // Prioriza 60+ FPS em todas as resoluções (8K, 4K, 1080p).
    const videoSelector = heightFilter
        ? `bv*${heightFilter}[fps>=60]+ba/bv*${heightFilter}+ba/b${heightFilter}/bv*+ba/b`
        : 'bv*[fps>=60]+ba/bv*+ba/b'

    // RESOLUÇÃO E FPS PRIMEIRO, sempre. O dono pediu a maior qualidade existente
    // (8K/4K a 60+ fps) em todas as plataformas de vídeo.
    const { MEDIA_LIMITS } = require('./constants')
    const teto = MEDIA_LIMITS.MAX_VIDEO_HEIGHT
    const ordem = `${teto < 4320 ? `res:${teto}` : 'res'},fps:60,fps,vcodec:h264,acodec:aac,abr,br`

    return {
        args: [
            '-f', videoSelector,
            '-S', ordem,
            // "mp4/mkv", não só "mp4": sem a trava de codec pode vir VP9 com
            // Opus, que não é combinação válida de MP4. Com a lista, o yt-dlp
            // usa MKV nesse caso em vez de gerar um MP4 quebrado — e o resto do
            // caminho (ensureMobileVideoCompatibility, videoSender) já trata
            // container diferente sem rotular errado.
            '--merge-output-format', 'mp4/mkv',
            '--embed-thumbnail',
            '--add-metadata'
        ],
        targetExt: 'mp4',
        mimeType: 'video/mp4'
    }
}

/**
 * Identifica o nome limpo e oficial da plataforma a partir da URL ou termo de pesquisa
 * @param {string} urlOrQuery
 * @returns {string}
 */
function getPlatformDisplayName(urlOrQuery) {
    if (!urlOrQuery || typeof urlOrQuery !== 'string') return 'YouTube'
    const clean = urlOrQuery.trim()
    // Link: decidido pelo host (plataformas.js). Antes era teste de pedaço de
    // texto e "dropbox.com" saía como "Twitter (X)" por terminar em "x.com".
    if (/^https?:\/\//i.test(clean)) return require('./plataformas').identificarLink(clean).nome
    // Texto sem link é busca por nome, e a busca é feita no YouTube.
    return 'YouTube'
}

const { spawnSync } = require('child_process')
const fs = require('fs')


/**
 * Traduz a ALTURA/LARGURA do vídeo no rótulo de qualidade limpo: 4K / 2K / 1080p / 720p.
 * Sem pixels crus (sem 1920x1080) e sem parênteses (sem 2160p).
 * @param {number} height
 * @param {number} [width]
 * @returns {string|null}
 */
function qualityLabel(height, width) {
    const a = Number(height) || 0
    const b = Number(width) || 0
    if (!a && !b) return null
    // A qualidade se nomeia pelo LADO MENOR, em qualquer orientação. Antes o
    // cálculo supunha vídeo deitado: um vertical 1080×1920 (TikTok, Reels,
    // Shorts) tinha "altura 1920" e saía como "2K".
    const curto = a && b ? Math.min(a, b) : (a || b)
    const longo = Math.max(a, b)
    if (curto >= 4320 || longo >= 7680) return '8K'
    if (curto >= 2880 || longo >= 5120) return '5K'
    if (curto >= 2160 || longo >= 3840) return '4K'
    if (curto >= 1440 || longo >= 2560) return '2K'
    if (curto >= 1080 || longo >= 1920) return '1080p'
    if (curto >= 720 || longo >= 1280) return '720p'
    // Abaixo de 720p o número exato diz mais que a faixa: 576×1024 é "576p".
    return `${curto}p`
}

const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MES_PT = /^(\d{1,2})\s+de\s+([a-zç]+)\.?\s+de\s+(\d{4})$/i

/**
 * Normaliza e formata data e ano de postagem a partir de metadados ou tags ID3/FFprobe
 */
function parseMediaDateAndYear(rawDate, rawYear, probeTags) {
    let year = rawYear ? String(rawYear).trim() : null
    let formattedDate = null

    if (rawDate) {
        if (typeof rawDate === 'number') {
            const d = new Date(rawDate > 1e11 ? rawDate : rawDate * 1000)
            if (!isNaN(d.getTime())) {
                year = year || String(d.getFullYear())
                formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
            }
        } else if (typeof rawDate === 'string') {
            const s = rawDate.trim()
            if (/^\d{8}$/.test(s)) {
                const y = s.slice(0, 4)
                const m = s.slice(4, 6)
                const d = s.slice(6, 8)
                year = year || y
                formattedDate = `${d}/${m}/${y}`
            } else if (/^\d{10,13}$/.test(s)) {
                const num = Number(s)
                const d = new Date(num > 1e11 ? num : num * 1000)
                if (!isNaN(d.getTime())) {
                    year = year || String(d.getFullYear())
                    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
                }
            } else if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
                const parts = s.split('T')[0].split('-')
                year = year || parts[0]
                formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`
            } else if (/^\d{4}$/.test(s)) {
                year = year || s
            } else if (MES_PT.test(s)) {
                // "23 de abr. de 2005" — é assim que a data chega quando vem da
                // página do YouTube em português, sem passar pelo yt-dlp.
                const m = s.match(MES_PT)
                const mes = MESES_PT.indexOf(m[2].toLowerCase().slice(0, 3)) + 1
                if (mes > 0) {
                    year = year || m[3]
                    formattedDate = `${String(m[1]).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${m[3]}`
                }
            } else if (/(\d+)\s+year[s]?\s+ago/i.test(s)) {
                const yearsAgo = parseInt(s.match(/(\d+)\s+year[s]?\s+ago/i)[1], 10)
                const currentY = new Date().getFullYear()
                year = year || String(currentY - yearsAgo)
            } else if (/(\d+)\s+month[s]?\s+ago/i.test(s)) {
                const monthsAgo = parseInt(s.match(/(\d+)\s+month[s]?\s+ago/i)[1], 10)
                const d = new Date()
                d.setMonth(d.getMonth() - monthsAgo)
                year = year || String(d.getFullYear())
                formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
            } else if (/(\d+)\s+day[s]?\s+ago/i.test(s)) {
                const daysAgo = parseInt(s.match(/(\d+)\s+day[s]?\s+ago/i)[1], 10)
                const d = new Date()
                d.setDate(d.getDate() - daysAgo)
                year = year || String(d.getFullYear())
                formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
            } else {
                const d = new Date(s)
                if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
                    year = year || String(d.getFullYear())
                    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
                }
            }
        }
    }

    if (probeTags && typeof probeTags === 'object') {
        const tagDate = probeTags.date || probeTags.DATE || probeTags.creation_time || probeTags.TYER || probeTags.TDRC || probeTags.year || probeTags.YEAR || probeTags.RELEASE_TIME
        if (tagDate && !formattedDate) {
            const str = String(tagDate).trim()
            if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
                const parts = str.split('T')[0].split('-')
                year = year || parts[0]
                formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`
            } else if (/^\d{8}$/.test(str)) {
                const y = str.slice(0, 4)
                const m = str.slice(4, 6)
                const d = str.slice(6, 8)
                year = year || y
                formattedDate = `${d}/${m}/${y}`
            } else if (/^\d{4}$/.test(str)) {
                year = year || str
            } else {
                const d = new Date(str)
                if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
                    year = year || String(d.getFullYear())
                    formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
                }
            }
        }
    }

    return { year, formattedDate }
}

/**
 * Código do post na plataforma de origem (o "v=" do YouTube e equivalentes).
 *
 * Tiramos da URL em vez de exigir que cada comando repasse o id: os metadados
 * chegam por caminhos diferentes (yt-dlp, oEmbed, tikwm, engine resiliente) e
 * em vários deles o campo `id` simplesmente não vem. A URL vem sempre.
 * @param {string} url
 * @param {string|number|null} [idExplicito] id já conhecido, tem prioridade
 * @returns {string|null}
 */
function extrairCodigo(url, idExplicito = null) {
    const id = String(idExplicito ?? '').trim()
    if (id && id.toLowerCase() !== 'undefined' && id.toLowerCase() !== 'null') return id.slice(0, 40)

    const u = String(url || '').trim()
    if (!u) return null

    const padroes = [
        /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{11})/i,
        /tiktok\.com\/(?:.*\/)?video\/(\d{6,})/i,
        /(?:instagram\.com|instagr\.am)\/(?:p|reel|reels|tv)\/([\w-]{5,})/i,
        /(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d{6,})/i,
        /pinterest\.[\w.]+\/pin\/(\d{6,})|pin\.it\/([\w-]{5,})/i,
        /open\.spotify\.com\/(?:intl-\w+\/)?(?:track|album|playlist)\/([\w-]{10,})/i,
        /(?:kwai\.com|kwai-video\.com)\/(?:.*\/)?(?:video\/|photo\/)?([\w-]{6,})/i
    ]
    for (const re of padroes) {
        const m = u.match(re)
        if (m) return (m[1] || m[2] || '').slice(0, 40) || null
    }
    return null
}

/**
 * Formata bytes em KB / MB / GB legível (nunca mostra bytes crus), na mesma
 * conta decimal do WhatsApp — ver utils/tamanho.js.
 */
function formatBytes(bytes) {
    const n = Number(bytes) || 0
    return n > 0 ? formatarTamanho(n) : null
}

/**
 * Duração em ms para tempo legível de download (ex.: "12s", "1m 05s").
 * Mínimo de 1s: quando a mídia vem do cache o total dá 0 ms, e "Pronto em 0s"
 * na legenda parece defeito.
 */
function formatElapsed(ms) {
    const s = Math.max(1, Math.round((Number(ms) || 0) / 1000))
    if (s < 60) return s + 's'
    return Math.floor(s / 60) + 'm ' + String(s % 60).padStart(2, '0') + 's'
}

/** Nome comercial do codec, do jeito que a pessoa reconhece. */
const NOME_CODEC = {
    h264: 'H.264', avc1: 'H.264', hevc: 'H.265', h265: 'H.265', vp9: 'VP9', vp8: 'VP8',
    av1: 'AV1', mpeg4: 'MPEG-4', mpeg2video: 'MPEG-2', theora: 'Theora', prores: 'ProRes',
    aac: 'AAC', mp3: 'MP3', opus: 'Opus', vorbis: 'Vorbis', flac: 'FLAC', alac: 'ALAC',
    ac3: 'AC-3', eac3: 'E-AC-3', pcm_s16le: 'PCM', mp2: 'MP2',
    mjpeg: 'JPEG', png: 'PNG', webp: 'WebP', gif: 'GIF', bmp: 'BMP'
}

function nomeCodec(codec) {
    const c = String(codec || '').toLowerCase()
    return c ? (NOME_CODEC[c] || c.toUpperCase()) : null
}

/** "30000/1001" → 29.97 → 30. Quadros por segundo já arredondados para exibição. */
function fpsDoStream(stream) {
    const bruto = String(stream?.avg_frame_rate || stream?.r_frame_rate || '')
    const [num, den] = bruto.split('/').map(Number)
    if (!num || !den) return null
    const fps = num / den
    if (!Number.isFinite(fps) || fps <= 0 || fps > 1000) return null
    // 29,97 vira 30; 59,94 vira 60; 23,976 vira 24. O resto mantém uma casa.
    // A folga tem de passar de 0,06 para pegar o 59,94, que é o fps mais comum
    // no 4K do YouTube — e era justamente o que saía como "59,94 fps".
    return Math.abs(fps - Math.round(fps)) < 0.08 ? Math.round(fps) : Math.round(fps * 10) / 10
}

/** 1 canal é mono, 2 é estéreo, 6 é 5.1 — ninguém fala "6 canais". */
function rotuloCanais(n) {
    const c = Number(n) || 0
    if (c === 1) return 'mono'
    if (c === 2) return 'estéreo'
    if (c === 6) return '5.1'
    if (c === 8) return '7.1'
    return c > 0 ? `${c} canais` : null
}

/** 320 → "320 kbps"; 18400 → "18,4 Mbps" (ninguém lê "18400 kbps"). */
function rotuloTaxa(kbps) {
    const n = Number(kbps) || 0
    if (n <= 0) return null
    if (n < 1000) return `${Math.round(n)} kbps`
    return `${String(Math.round(n / 100) / 10).replace('.', ',')} Mbps`
}

/** 48000 → "48 kHz"; 44100 → "44,1 kHz". */
function rotuloAmostragem(hz) {
    const n = Number(hz) || 0
    if (n <= 0) return null
    const k = n / 1000
    return `${String(Number.isInteger(k) ? k : Math.round(k * 10) / 10).replace('.', ',')} kHz`
}

/** Proporção reduzida da imagem/vídeo: 1920×1080 → "16:9". Só as usuais. */
function proporcao(width, height) {
    const w = Number(width) || 0
    const h = Number(height) || 0
    if (!w || !h) return null
    const mdc = (a, b) => (b ? mdc(b, a % b) : a)
    const d = mdc(w, h)
    const rw = w / d
    const rh = h / d
    // Proporção "1447:814" não diz nada a ninguém; só mostro quando é redonda.
    return (rw <= 32 && rh <= 32) ? `${rw}:${rh}` : null
}

/**
 * Inspeciona o arquivo REAL com ffprobe e retorna dados verdadeiros — nada inventado.
 * @param {string} filePath
 * @returns {null | { container, vcodec, acodec, bitrateKbps, totalBitrateKbps, fps,
 *   sampleRateHz, channels, width, height, resolution, sizeBytes, sizeMB, durationSec,
 *   isAudio, hasVideo, tags }}
 */
function probeMedia(filePath) {
    try {
        if (!filePath || !fs.existsSync(filePath)) return null
        const r = spawnSync('ffprobe', [
            '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', filePath
        ], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
        if (r.status !== 0 || !r.stdout) return null
        const data = JSON.parse(r.stdout)
        const fmt = data.format || {}
        const tags = fmt.tags || {}
        const streams = data.streams || []
        const v = streams.find(s => s.codec_type === 'video' && s.disposition?.attached_pic !== 1)
        const a = streams.find(s => s.codec_type === 'audio')
        const rawBitrate = Number(a?.bit_rate || fmt.bit_rate || 0)
        // Só o NÚMERO. Guardar "320 kbps" aqui fazia a exibição concatenar a
        // unidade de novo e sair "320 kbps kbps".
        const bitrateKbps = rawBitrate > 0 ? Math.round(rawBitrate / 1000) : null
        const sizeBytes = (filePath && fs.existsSync(filePath)) ? fs.statSync(filePath).size : (Number(fmt.size) || 0)
        const durationSec = Math.round(Number(fmt.duration || (v?.duration) || (a?.duration) || 0))
        // ffprobe reporta a família "mov,mp4,m4a,3gp,..." — normaliza para MP4/M4A.
        const rawContainer = (fmt.format_name || '')
        let container = rawContainer.split(',')[0] || filePath.split('.').pop()
        if (/mp4|mov|m4a|3gp/i.test(rawContainer)) {
            container = (a && !v) ? 'M4A' : 'MP4'
        }
        const totalBruto = Number(fmt.bit_rate || 0)
        return {
            container: container.toUpperCase(),
            vcodec: v?.codec_name || null,
            acodec: a?.codec_name || null,
            bitrateKbps,
            totalBitrateKbps: totalBruto > 0 ? Math.round(totalBruto / 1000) : null,
            fps: v ? fpsDoStream(v) : null,
            sampleRateHz: Number(a?.sample_rate) || null,
            channels: Number(a?.channels) || null,
            width: v?.width || 0,
            height: v?.height || 0,
            resolution: v ? `${v.width}x${v.height}` : null,
            sizeBytes,
            sizeMB: sizeBytes ? emMb(sizeBytes) : null,
            durationSec,
            isAudio: !v,
            hasVideo: Boolean(v),
            tags
        }
    } catch (err) {
        logger.debug(`[PROBE] ffprobe não leu ${filePath}: ${err.message}`)
        return null
    }
}

// Títulos de preenchimento que não dizem nada — melhor mostrar só o tipo.
const TITULOS_GENERICOS = new Set(['', 'mídia', 'midia', 'vídeo', 'video', 'áudio', 'audio', 'vídeo do youtube'])

function _tituloReal(title) {
    const t = String(title || '').trim()
    return TITULOS_GENERICOS.has(t.toLowerCase()) ? '' : t
}

function _valorReal(v) {
    const s = String(v || '').trim()
    return (!s || s === '—' || s === '00:00' || /^desconhecido$/i.test(s)) ? '' : s
}

// Teto de legenda de mídia do WhatsApp. Passando disso, a mensagem é recusada.
const LIMITE_LEGENDA = 1024

/**
 * Legenda da mídia baixada, em moldura, com os dados REAIS do arquivo (via
 * ffprobe quando há filePath):
 *
 *   ╔══════════════════════════════╗
 *   ║   🎬 *VÍDEO BAIXADO* 🎬   ║
 *   ╚══════════════════════════════╝
 *
 *   ╭━〔 🌐 DETALHES DA MÍDIA 〕━⬣
 *   ┃ 📱 *Plataforma:* YouTube
 *   ┃ 📝 *Título:* Numb
 *   ┃ 👤 *Autor:* Linkin Park
 *   ┃ 📅 *Publicado em:* 12/03/2024
 *   ┃ 🔗 *Fonte:* https://...
 *   ╰━━━━━━━━━━━━━━━━━━⬣
 *
 *   ╭━〔 📄 FICHA DO ARQUIVO 〕━⬣
 *   ┃ 📦 *Formato:* MP4 (H.264 + AAC)
 *   ┃ 🎬 *Qualidade:* 1080p — 1920×1080 a 30 fps
 *   ┃ 🎚️ *Áudio:* AAC 192 kbps · 48 kHz · estéreo
 *   ┃ ⏱️ *Duração:* 3:07
 *   ┃ 💾 *Tamanho:* 71,2 MB
 *   ┃ 📊 *Taxa de bits:* 3045 kbps
 *   ┃ ⏬ *Baixado em:* 25s
 *   ╰━━━━━━━━━━━━━━━━━━⬣
 *
 *   👑 *Nome do bot*
 *
 * Só entra linha com dado que existe: nada de valor padrão inventado ("1080p",
 * "320 kbps"). O visual de caixa voltou por decisão do dono em 2026-09-18.
 *
 * O código do post (🆔) saiu em 2026-09-20 a pedido do dono: no lugar dele a
 * ficha mostra o que o arquivo REALMENTE é — codec, resolução, fps, taxa de
 * bits, amostragem e canais. O link da fonte continua ali para pedir de novo.
 * @param {object} params
 * @returns {string}
 */
/**
 * Calcula o tempo decorrido desde o momento que o usuário enviou o comando no WhatsApp
 * até a resposta ser montada/enviada, em milissegundos.
 * Se info.messageTimestamp estiver presente (timestamp real do WhatsApp em segundos ou ms),
 * utiliza a diferença real. Caso contrário, usa inicioFallback (início da execução do comando).
 * @param {object} [info] - Mensagem do Baileys contendo messageTimestamp
 * @param {number} [inicioFallback] - Fallback de Date.now() caso info não tenha timestamp
 * @returns {number}
 */
function calcularTempoComando(info, inicioFallback = Date.now()) {
    let msgTimestamp = null
    const rawTs = info?.messageTimestamp
    if (typeof rawTs === 'number') {
        msgTimestamp = rawTs > 1e11 ? rawTs : rawTs * 1000
    } else if (rawTs && typeof rawTs.low === 'number') {
        msgTimestamp = rawTs.low > 1e11 ? rawTs.low : rawTs.low * 1000
    } else if (rawTs && !isNaN(Number(rawTs))) {
        const n = Number(rawTs)
        msgTimestamp = n > 1e11 ? n : n * 1000
    }

    const agora = Date.now()
    if (msgTimestamp && msgTimestamp <= agora && (agora - msgTimestamp) < 24 * 60 * 60 * 1000) {
        return Math.max(1000, agora - msgTimestamp)
    }
    const fallback = inicioFallback || agora
    return Math.max(1000, agora - fallback)
}

function formatMediaCaption({
    platform = '',
    title = '',
    author = '',
    durationFormatted = '',
    url = '',
    isAudio = false,
    isImage = false,
    filePath = null,
    elapsedMs = null,
    info = null,
    startTime = null,
    fileProbe = null,
    uploadDate = null,
    year = null,
    audioBitrate = null,
    quality = null,
    id = null,
    rotuloOrigem = null,
    rotuloAutor = null
} = {}) {
    const probe = fileProbe || (filePath ? probeMedia(filePath) : null)
    const isImg = isImage || (filePath && /\.(jpe?g|png|webp|gif|bmp)$/i.test(filePath))
    const audio = !isImg && (probe ? probe.isAudio : isAudio)
    const icon = isImg ? '📸' : (audio ? '🎵' : '🎬')
    const cabecalho = isImg ? 'Imagem baixada' : (audio ? 'Áudio baixado' : 'Vídeo baixado')

    // ── Detalhes da mídia (limpos e essenciais) ───────────────────
    const detalhes = []
    const deDetalhe = (emoji, rotulo, valor) => { if (valor) detalhes.push(`${emoji} *${rotulo}:* ${valor}`) }

    const ficheiro = require('./fichaDaMidia')
    const origemNome = ficheiro.origemDe({ plataforma: platform, url }) || _valorReal(platform)
    const rotuloAutorFinal = rotuloAutor || 'Autor'
    const autorLimpo = ficheiro.limparArtista(author)

    deDetalhe('📱', rotuloOrigem || 'Plataforma', origemNome)
    deDetalhe(icon, 'Tipo', isImg ? 'Imagem' : (audio ? 'Áudio' : 'Vídeo'))
    deDetalhe('📝', 'Título', _tituloReal(title).slice(0, 100))
    deDetalhe('👤', rotuloAutorFinal, _valorReal(autorLimpo))

    // Duração real (do arquivo) tem prioridade sobre a informada
    if (!isImg) {
        if (probe && probe.durationSec > 0) deDetalhe('⏱️', 'Duração', formatDuration(probe.durationSec))
        else deDetalhe('⏱️', 'Duração', _valorReal(durationFormatted))
    }

    // Qualidade limpa (rótulo comercial: 4K, 1080p, 720p ou taxa: 320 kbps)
    if (!isImg) {
        if (!audio) {
            const rotulo = probe ? qualityLabel(probe.height, probe.width) : null
            const pedido = /^\d{3,4}p$|^[248]K$/i.test(String(quality || '')) ? quality : ''
            deDetalhe('🎬', 'Qualidade', rotulo || pedido || (probe?.height ? `${probe.height}p` : ''))
        } else {
            const taxa = (probe && rotuloTaxa(probe.bitrateKbps)) || _valorReal(audioBitrate)
            deDetalhe('🎚️', 'Qualidade', taxa)
        }
    } else if (probe && probe.width && probe.height) {
        const prop = proporcao(probe.width, probe.height)
        deDetalhe('📐', 'Resolução', `${probe.width}×${probe.height}${prop ? ` (${prop})` : ''}`)
    }

    // Tamanho do arquivo
    let bytes = probe ? probe.sizeBytes : 0
    if (!bytes && filePath && fs.existsSync(filePath)) bytes = fs.statSync(filePath).size
    deDetalhe('💾', 'Tamanho', formatBytes(bytes))

    // Data de publicação
    const { year: parsedYear, formattedDate } = parseMediaDateAndYear(uploadDate, year, probe?.tags)
    deDetalhe('📅', 'Publicado em', formattedDate || (parsedYear ? String(parsedYear) : ''))

    // Fonte
    if (url) deDetalhe('🔗', 'Fonte', url)

    // Tempo gasto desde o envio do comando até a resposta (real para o usuário)
    const tempoDecorrido = (elapsedMs && Number(elapsedMs) > 0)
        ? elapsedMs
        : ((info || startTime) ? calcularTempoComando(info, startTime) : null)

    if (tempoDecorrido && Number(tempoDecorrido) > 0) {
        deDetalhe('⏬', 'Baixado em', formatElapsed(tempoDecorrido))
    }

    // Próximos passos do comando que a pessoa usou
    const passos = require('./fichaDaMidia').proximosDe({
        tipo: isImg ? 'imagem' : (audio ? 'áudio' : 'vídeo'),
        plataforma: _valorReal(platform), url, titulo: _tituloReal(title)
    }).map(p => `• \`.${p.nome}${p.args ? ' ' + p.args : ''}\` — ${p.oque}`)

    const montar = (comFonte, comPassos = true) => [
        M.cabecalho(icon, cabecalho),
        M.secao('🌐', 'Detalhes da mídia', comFonte ? detalhes : detalhes.filter(l => !l.startsWith('🔗'))),
        comPassos && passos.length > 0 ? M.secao('👉', 'Próximos passos', passos) : '',
        '🔬 Para ficha técnica detalhada com codecs e taxas: responda com .mediainfo',
        M.assinatura()
    ].filter(Boolean).join('\n\n')

    let legenda = montar(true)
    if (legenda.length > LIMITE_LEGENDA) legenda = montar(false)
    if (legenda.length > LIMITE_LEGENDA) legenda = montar(false, false)
    return legenda.length > LIMITE_LEGENDA ? legenda.slice(0, LIMITE_LEGENDA - 1) + '…' : legenda
}

function formatDuration(sec) {
    sec = Math.max(0, Math.round(sec))
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    const pad = (n) => String(n).padStart(2, '0')
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/**
 * Calcula o tempo estimado de espera baseado na duração ou tipo de mídia
 * @param {number|string} duration
 * @returns {string}
 */
function getEstimatedWaitTime(duration) {
    let sec = 0
    if (typeof duration === 'number') sec = duration
    else if (typeof duration === 'string' && duration.includes(':')) {
        const parts = duration.split(':').map(Number)
        if (parts.length === 2) sec = parts[0] * 60 + parts[1]
        else if (parts.length === 3) sec = parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
    if (sec <= 0) return '~5 a 12 seg'
    if (sec <= 60) return '~4 a 8 seg'
    if (sec <= 300) return '~8 a 15 seg'
    if (sec <= 900) return '~15 a 30 seg'
    if (sec <= 1800) return '~30 a 60 seg'
    return '~1 a 2 min'
}

/**
 * Aviso curto de que o download começou: "⏳ Baixando *título*…".
 * Sem título conhecido, diz só o tipo ("⏳ Baixando o vídeo…").
 * @param {object} params
 * @returns {string}
 */
function formatDownloadProgressCard({ platform = '', title = '', isAudio = false, estimatedTime = null, sizeMB = null, quality = null, elapsedMs = null } = {}) {
    const titulo = _tituloReal(title).slice(0, 80)
    let doc = titulo
        ? `⏳ Baixando *${titulo}*…`
        : `⏳ Baixando ${isAudio ? 'o áudio' : 'o vídeo'}…`
    if (sizeMB) doc += `\nCerca de ${sizeMB} MB.`
    return doc
}

module.exports = {
    qualityLabel,
    nomeCodec,
    rotuloCanais,
    rotuloAmostragem,
    rotuloTaxa,
    proporcao,
    resolveDownloadFormat,
    getPlatformDisplayName,
    formatMediaCaption,
    calcularTempoComando,
    getEstimatedWaitTime,
    formatDownloadProgressCard,
    probeMedia,
    formatBytes,
    formatElapsed,
    formatDuration,
    parseMediaDateAndYear,
    extrairCodigo
}

