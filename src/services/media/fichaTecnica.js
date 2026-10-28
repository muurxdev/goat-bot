/**
 * Ficha técnica completa de um arquivo ou de um link — o que o .mediainfo mostra.
 *
 * A legenda dos downloads traz um resumo (formatResolver.formatMediaCaption).
 * Aqui vai TUDO o que o arquivo informa: codec com perfil e nível, resolução em
 * pixels, proporção de tela e de pixel, fps médio e nominal, profundidade de
 * cor, HDR, taxa de cada faixa, amostragem, canais e layout, EXIF da foto e as
 * tags de metadados. Para um link, mostra os melhores formatos que a
 * plataforma oferece, sem baixar nada.
 *
 * Só dado medido: linha sem valor não aparece.
 */

const fs = require('fs')
const { spawn } = require('child_process')
const logger = require('../../core/logger')
const M = require('../../utils/moldura')
const { formatarTamanho } = require('../../utils/tamanho')
const {
    nomeCodec, rotuloCanais, rotuloAmostragem, rotuloTaxa, qualityLabel, proporcao, formatDuration
} = require('./formatResolver')

const TEMPO_PROBE_MS = 20000
const TEMPO_LINK_MS = 45000

/** Roda um programa e devolve a saída padrão (texto). Rejeita no timeout. */
function rodar(cmd, args, timeoutMs) {
    return new Promise((resolve, reject) => {
        let proc
        try { proc = spawn(cmd, args) } catch (err) { return reject(err) }
        let out = ''
        let erro = ''
        const timer = setTimeout(() => {
            try { proc.kill('SIGKILL') } catch (e) { logger.warn(`[FICHA] ${cmd} não morreu no timeout: ${e.message}`) }
            reject(new Error(`${cmd} passou de ${Math.round(timeoutMs / 1000)} s`))
        }, timeoutMs)
        proc.stdout.on('data', d => { out += d; if (out.length > 16 * 1024 * 1024) proc.kill('SIGKILL') })
        proc.stderr.on('data', d => { erro = String(d).slice(-300) })
        proc.on('error', e => { clearTimeout(timer); reject(e) })
        proc.on('close', code => {
            clearTimeout(timer)
            if (code === 0) resolve(out)
            else reject(new Error(`${cmd} saiu com ${code}: ${erro.trim()}`))
        })
    })
}

// ── Formatação ────────────────────────────────────────────────────────

const num = n => Number(n)
const ok = v => v !== null && v !== undefined && v !== '' && !(typeof v === 'number' && !Number.isFinite(v))

/** 1234567 -> "1.234.567" */
const milhar = n => Number(n).toLocaleString('pt-BR')

/** "30000/1001" -> 29.97 (número) */
function fracao(txt) {
    const [a, b] = String(txt || '').split('/').map(Number)
    if (!a || !b) return null
    const v = a / b
    return Number.isFinite(v) && v > 0 && v < 1000 ? v : null
}

/** 29.97 -> "29,97"; 30 -> "30" */
function fpsTexto(v) {
    if (!ok(v)) return null
    // Até 3 casas, sem zeros à direita: 30 -> "30", 29.97 -> "29,97", 23.976 -> "23,976".
    return String(Math.round(v * 1000) / 1000).replace('.', ',')
}

/** Segundos com milésimos: 187.456 -> "3:07,456" */
function duracaoPrecisa(seg) {
    const s = num(seg)
    if (!ok(s) || s <= 0) return null
    const ms = Math.round((s % 1) * 1000)
    return `${formatDuration(Math.floor(s))},${String(ms).padStart(3, '0')}`
}

const bytesExatos = b => `${formatarTamanho(b)} (${milhar(b)} bytes)`

/** Linha "emoji *Rótulo:* valor" — some sem valor. */
function campo(lista, emoji, rotulo, valor) {
    if (ok(valor)) lista.push(`${emoji} *${rotulo}:* ${valor}`)
}

const PERFIS_AAC = { LC: 'AAC-LC', HE: 'HE-AAC', 'HE-AACv2': 'HE-AAC v2', LD: 'AAC-LD', ELD: 'AAC-ELD' }

/** "H.264 · High · nível 4.0" */
function codecCompleto(s) {
    const partes = [nomeCodec(s.codec_name)]
    if (s.profile && !/unknown/i.test(s.profile)) partes.push(PERFIS_AAC[s.profile] || s.profile)
    if (s.codec_type === 'video' && Number(s.level) > 0) {
        // H.264/HEVC informam o nível multiplicado por 10 (40 = 4.0; HEVC por 30).
        const lv = s.codec_name === 'hevc' ? s.level / 30 : s.level / 10
        partes.push(`nível ${String(Math.round(lv * 10) / 10).replace('.', ',')}`)
    }
    const tag = String(s.codec_tag_string || '')
    if (tag && !/^\[|^0x/.test(tag) && tag.toLowerCase() !== String(s.codec_name).toLowerCase()) partes.push(tag)
    return partes.filter(Boolean).join(' · ')
}

/** HDR a partir da curva de transferência. */
function hdrDe(s) {
    const t = String(s.color_transfer || '')
    if (t === 'smpte2084') return 'HDR10 (PQ)'
    if (t === 'arib-std-b67') return 'HLG'
    return null
}

// ── EXIF mínimo (IFD0) ────────────────────────────────────────────────

/**
 * Lê fabricante, modelo, programa, data e se há GPS do bloco EXIF que o sharp
 * devolve. Parser pequeno de propósito: as fotos enviadas como FOTO no
 * WhatsApp chegam sem EXIF; só documento traz, e basta o IFD0.
 */
function lerExif(buf) {
    try {
        if (!Buffer.isBuffer(buf) || buf.length < 14) return null
        let base = buf.indexOf('Exif\0\0') === 0 ? 6 : 0
        const le = buf.toString('ascii', base, base + 2) === 'II'
        const u16 = o => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o))
        const u32 = o => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o))
        const ifd = base + u32(base + 4)
        const n = u16(ifd)
        const tags = {}
        for (let i = 0; i < n && ifd + 2 + i * 12 + 12 <= buf.length; i++) {
            const e = ifd + 2 + i * 12
            const tag = u16(e)
            const tipo = u16(e + 2)
            const qtd = u32(e + 4)
            if (tipo === 2) {
                const off = qtd > 4 ? base + u32(e + 8) : e + 8
                tags[tag] = buf.toString('latin1', off, off + qtd).replace(/\0+$/, '').trim()
            } else {
                tags[tag] = u32(e + 8)
            }
        }
        return {
            fabricante: tags[0x010F] || null,
            modelo: tags[0x0110] || null,
            programa: tags[0x0131] || null,
            data: tags[0x0132] || null,
            temGps: tags[0x8825] !== undefined
        }
    } catch (err) {
        logger.debug(`[FICHA] EXIF ilegível: ${err.message}`)
        return null
    }
}

// ── Arquivo ───────────────────────────────────────────────────────────

/**
 * Ficha completa de um arquivo local.
 * @param {string} filePath
 * @param {object} [o]
 * @param {string} [o.nome]        nome original do arquivo, se houver
 * @param {string} [o.mimetype]
 * @param {string} [o.origem]      'figurinha' | 'nota de voz' | 'GIF' | ...
 * @param {string[]} [o.naMensagem] linhas extras sobre a mensagem do WhatsApp
 * @returns {Promise<string>}
 */
async function fichaDoArquivo(filePath, { nome = null, mimetype = null, origem = null, naMensagem = [] } = {}) {
    const tamanho = fs.statSync(filePath).size

    let dados = null
    try {
        dados = JSON.parse(await rodar('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', filePath], TEMPO_PROBE_MS))
    } catch (err) {
        logger.warn(`[FICHA] ffprobe não leu ${filePath}: ${err.message}`)
    }
    const fmt = dados?.format || {}
    const streams = dados?.streams || []
    const videos = streams.filter(s => s.codec_type === 'video' && s.disposition?.attached_pic !== 1)
    const capas = streams.filter(s => s.codec_type === 'video' && s.disposition?.attached_pic === 1)
    const audios = streams.filter(s => s.codec_type === 'audio')
    const legendas = streams.filter(s => s.codec_type === 'subtitle')

    // Imagem: ffprobe devolve como "vídeo" de 1 quadro. O sharp sabe mais.
    const formatoNome = String(fmt.format_name || '')
    const pareceImagem = /image2|png_pipe|jpeg_pipe|webp_pipe|gif|bmp_pipe|tiff_pipe|avif|heif/.test(formatoNome) ||
        (videos.length === 1 && !audios.length && (!num(fmt.duration) || num(fmt.duration) < 0.05)) ||
        /^image\//.test(mimetype || '')
    let img = null
    if (pareceImagem || !dados) {
        try {
            const sharp = require('sharp')
            img = await sharp(filePath, { failOn: 'none', animated: true }).metadata()
        } catch (err) {
            logger.debug(`[FICHA] sharp não leu ${filePath}: ${err.message}`)
        }
    }

    const tipo = origem
        || (img && !audios.length && (!videos.length || pareceImagem) ? (img.pages > 1 ? 'Imagem animada' : 'Imagem')
            : videos.length ? 'Vídeo'
                : audios.length ? 'Áudio'
                    : 'Arquivo')

    // ── Arquivo
    const arq = []
    campo(arq, '📄', 'Nome', nome)
    campo(arq, '🗂️', 'Tipo', tipo)
    const container = String(fmt.format_long_name || '').replace(/\s*\/.*$/, '') || (img ? String(img.format || '').toUpperCase() : null)
    campo(arq, '📦', 'Formato', container)
    campo(arq, '🏷️', 'MIME', mimetype)
    campo(arq, '💾', 'Tamanho', bytesExatos(tamanho))
    if (!img || videos.length > 1 || audios.length) campo(arq, '⏱️', 'Duração', duracaoPrecisa(fmt.duration))
    if (num(fmt.bit_rate) > 0 && (videos.length || audios.length) && !pareceImagem) campo(arq, '📊', 'Taxa total', rotuloTaxa(num(fmt.bit_rate) / 1000))
    const faixas = [
        videos.length ? `${videos.length} de vídeo` : null,
        audios.length ? `${audios.length} de áudio` : null,
        legendas.length ? `${legendas.length} de legenda` : null,
        capas.length ? 'capa embutida' : null
    ].filter(Boolean)
    if (!pareceImagem) campo(arq, '🧩', 'Faixas', faixas.join(' · '))

    // ── Vídeo (uma seção por faixa)
    const secoesVideo = pareceImagem ? [] : videos.map((s, i) => {
        const l = []
        campo(l, '🎞️', 'Codec', codecCompleto(s))
        const w = num(s.width)
        const h = num(s.height)
        const rot = Math.abs(num((s.side_data_list || []).find(d => d.rotation !== undefined)?.rotation || s.tags?.rotate || 0))
        const deitado = rot === 90 || rot === 270
        const [lw, lh] = deitado ? [h, w] : [w, h]
        if (w && h) {
            campo(l, '📐', 'Resolução', `${lw}×${lh} px (${qualityLabel(lh, lw)})`)
            campo(l, '🧭', 'Orientação', (lh > lw ? 'vertical' : lh === lw ? 'quadrado' : 'horizontal') + (rot ? ` · girado ${rot}°` : ''))
            campo(l, '🖥️', 'Proporção', s.display_aspect_ratio && s.display_aspect_ratio !== '0:1' ? s.display_aspect_ratio : proporcao(lw, lh))
            if (s.sample_aspect_ratio && !['1:1', '0:1', 'N/A'].includes(s.sample_aspect_ratio)) campo(l, '🔲', 'Pixel', `não quadrado (${s.sample_aspect_ratio})`)
            campo(l, '🔢', 'Megapixels', String(Math.round(lw * lh / 10000) / 100).replace('.', ',') + ' MP')
        }
        const fpsMedio = fracao(s.avg_frame_rate)
        const fpsNominal = fracao(s.r_frame_rate)
        if (fpsMedio || fpsNominal) {
            const variavel = fpsMedio && fpsNominal && Math.abs(fpsMedio - fpsNominal) > 0.05
            campo(l, '🎯', 'FPS', `${fpsTexto(fpsMedio || fpsNominal)} fps` + (variavel ? ` (variável; nominal ${fpsTexto(fpsNominal)})` : ' (constante)'))
        }
        campo(l, '📊', 'Taxa', num(s.bit_rate) > 0 ? rotuloTaxa(num(s.bit_rate) / 1000) : null)
        campo(l, '🧮', 'Quadros', num(s.nb_frames) > 0 ? milhar(s.nb_frames) : null)
        const bits = num(s.bits_per_raw_sample) || (/(10|12)(le|be)$/.test(s.pix_fmt || '') ? Number((s.pix_fmt.match(/(10|12)(le|be)$/) || [])[1]) : (s.pix_fmt ? 8 : null))
        campo(l, '🎨', 'Cor', [s.pix_fmt, bits ? `${bits} bits` : null, s.color_space && s.color_space !== 'unknown' ? s.color_space : null, s.color_range ? (s.color_range === 'pc' ? 'faixa completa' : 'faixa limitada') : null].filter(Boolean).join(' · '))
        campo(l, '🌈', 'HDR', hdrDe(s) || 'não (SDR)')
        campo(l, '🧵', 'Varredura', s.field_order && s.field_order !== 'unknown' ? (s.field_order === 'progressive' ? 'progressiva' : `entrelaçada (${s.field_order})`) : null)
        campo(l, '🔁', 'Quadros B', Number(s.has_b_frames) > 0 ? `sim (${s.has_b_frames})` : (s.has_b_frames === 0 ? 'não' : null))
        campo(l, '🌐', 'Idioma', s.tags?.language && s.tags.language !== 'und' ? s.tags.language : null)
        return M.secao('🎬', videos.length > 1 ? `Vídeo ${i + 1}` : 'Vídeo', l)
    })

    // ── Áudio
    const secoesAudio = audios.map((s, i) => {
        const l = []
        campo(l, '🎵', 'Codec', codecCompleto(s))
        // Alguns contêineres (MP3 VBR, Opus em Ogg) não informam a taxa da
        // faixa; aí vale a do arquivo inteiro, que num arquivo só de áudio é a mesma.
        const taxaFaixa = num(s.bit_rate) > 0 ? rotuloTaxa(num(s.bit_rate) / 1000) : null
        const taxaArquivo = !videos.length && num(fmt.bit_rate) > 0 ? rotuloTaxa(num(fmt.bit_rate) / 1000) + ' (média do arquivo)' : null
        campo(l, '📊', 'Taxa', taxaFaixa || taxaArquivo)
        campo(l, '〰️', 'Amostragem', rotuloAmostragem(s.sample_rate))
        campo(l, '🔊', 'Canais', [rotuloCanais(s.channels), s.channel_layout && !/^(mono|stereo)$/.test(s.channel_layout) ? s.channel_layout : null].filter(Boolean).join(' · '))
        const bitsA = num(s.bits_per_raw_sample) || num(s.bits_per_sample)
        campo(l, '🎚️', 'Profundidade', bitsA ? `${bitsA} bits` : (s.sample_fmt ? `${s.sample_fmt}` : null))
        campo(l, '⏱️', 'Duração', !videos.length ? null : duracaoPrecisa(s.duration))
        campo(l, '🌐', 'Idioma', s.tags?.language && s.tags.language !== 'und' ? s.tags.language : null)
        return M.secao('🎧', audios.length > 1 ? `Áudio ${i + 1}` : 'Áudio', l)
    })

    // ── Imagem
    let secaoImagem = ''
    if (img && pareceImagem) {
        const l = []
        const w = num(img.width)
        const h = num(img.pageHeight || img.height)
        campo(l, '🖼️', 'Formato', String(img.format || '').toUpperCase() + (img.isProgressive ? ' (progressivo)' : ''))
        if (w && h) {
            campo(l, '📐', 'Resolução', `${w}×${h} px`)
            campo(l, '🖥️', 'Proporção', proporcao(w, h) || String(Math.round(w / h * 100) / 100).replace('.', ',') + ':1')
            campo(l, '🔢', 'Megapixels', String(Math.round(w * h / 10000) / 100).replace('.', ',') + ' MP')
            campo(l, '🧭', 'Orientação', h > w ? 'vertical' : h === w ? 'quadrada' : 'horizontal')
        }
        campo(l, '🎨', 'Cor', [img.space, img.channels ? `${img.channels} canais` : null, img.depth ? img.depth.replace('uchar', '8 bits').replace('ushort', '16 bits') : null].filter(Boolean).join(' · '))
        campo(l, '🫥', 'Transparência', img.hasAlpha ? 'sim' : 'não')
        campo(l, '🖨️', 'Densidade', img.density ? `${img.density} DPI` : null)
        campo(l, '🎞️', 'Quadros', img.pages > 1 ? `${img.pages} (animada${img.delay ? `, ${fpsTexto(1000 / (img.delay.reduce((a, b) => a + b, 0) / img.delay.length))} fps` : ''})` : null)
        campo(l, '🔄', 'Rotação EXIF', img.orientation && img.orientation !== 1 ? `código ${img.orientation}` : null)
        campo(l, '🌈', 'Perfil de cor', img.icc ? 'sim (ICC embutido)' : null)
        const exif = lerExif(img.exif)
        if (exif) {
            campo(l, '📷', 'Câmera', [exif.fabricante, exif.modelo].filter(Boolean).join(' '))
            campo(l, '🛠️', 'Programa', exif.programa)
            campo(l, '📅', 'Data da foto', exif.data)
            if (exif.temGps) l.push('📍 *Localização:* a foto guarda coordenadas de GPS')
        }
        secaoImagem = M.secao('🖼️', 'Imagem', l)
    }

    // ── Tags de metadados (título, artista, programa que gerou…)
    const tags = { ...(fmt.tags || {}) }
    const ROTULOS = {
        title: 'Título', artist: 'Artista', album: 'Álbum', album_artist: 'Artista do álbum', date: 'Data',
        genre: 'Gênero', track: 'Faixa', comment: 'Comentário', encoder: 'Gerado por', creation_time: 'Criado em',
        major_brand: 'Marca do contêiner', compatible_brands: 'Compatível com', handler_name: 'Manipulador'
    }
    const meta = []
    for (const [chave, rotulo] of Object.entries(ROTULOS)) {
        const v = tags[chave] ?? tags[chave.toUpperCase()]
        if (ok(v)) campo(meta, '•', rotulo, String(v).slice(0, 120))
    }

    const titulo = tipo === 'Vídeo' ? 'Ficha do vídeo' : tipo === 'Áudio' || tipo === 'Nota de voz' ? 'Ficha do áudio'
        : /Imagem|Figurinha|GIF/.test(tipo) ? `Ficha da ${tipo.toLowerCase().includes('figurinha') ? 'figurinha' : 'imagem'}` : 'Ficha do arquivo'

    return [
        M.cabecalho('🔬', titulo),
        M.secao('📄', 'Ficha do arquivo', arq),
        ...secoesVideo,
        ...secoesAudio,
        secaoImagem,
        M.secao('🏷️', 'Metadados', meta),
        M.secao('📨', 'Na mensagem', naMensagem),
        dados || img ? '' : '⚠️ _Não consegui ler o conteúdo: o formato não é de áudio, vídeo nem imagem que eu reconheça._',
        M.assinatura()
    ].filter(Boolean).join('\n\n')
}

// ── Link ──────────────────────────────────────────────────────────────

/**
 * O que a plataforma oferece para este link, sem baixar: o melhor vídeo, o
 * melhor áudio e quantos formatos existem. É o teto de qualidade possível.
 * @param {string} url
 * @param {{ userJid?: string }} [o]
 * @returns {Promise<string>}
 */
async function fichaDoLink(url, { userJid = null } = {}) {
    const { urlSeguraResolvida } = require('./urlSeguro')
    if (!(await urlSeguraResolvida(url))) throw Object.assign(new Error('Esse link aponta para um endereço que eu não acesso.'), { code: 'SECURITY_VIOLATION' })

    const { identificarLink } = require('./plataformas')
    const { buildYtDlpArgs, getYtDlpEnv } = require('./mediaArgs')
    const link = identificarLink(url)

    const args = buildYtDlpArgs(['-J', '--no-playlist', '--no-warnings', '--skip-download', url], { userJid })
    const saida = await new Promise((resolve, reject) => {
        const proc = spawn('yt-dlp', args, { env: getYtDlpEnv() })
        let out = ''
        let erro = ''
        const timer = setTimeout(() => { try { proc.kill('SIGKILL') } catch (e) { logger.warn(`[FICHA] yt-dlp não morreu: ${e.message}`) } reject(new Error('A plataforma demorou demais para responder.')) }, TEMPO_LINK_MS)
        proc.stdout.on('data', d => { out += d; if (out.length > 32 * 1024 * 1024) proc.kill('SIGKILL') })
        proc.stderr.on('data', d => { erro = String(d).slice(-400) })
        proc.on('error', e => { clearTimeout(timer); reject(e) })
        proc.on('close', code => { clearTimeout(timer); code === 0 ? resolve(out) : reject(new Error(require('./mediaErrors').toMessage('A plataforma não mostrou os formatos desse link.', erro))) })
    })
    const d = JSON.parse(saida)
    const formatos = Array.isArray(d.formats) ? d.formats : []
    const comVideo = formatos.filter(f => f.vcodec && f.vcodec !== 'none' && num(f.height) > 0)
    const soAudio = formatos.filter(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'))

    const melhorV = comVideo.sort((a, b) => (num(b.height) - num(a.height)) || (num(b.fps) - num(a.fps)) || (num(b.tbr) - num(a.tbr)))[0]
    const melhorA = soAudio.sort((a, b) => (num(b.abr) - num(a.abr)) || (num(b.asr) - num(a.asr)))[0]
        || formatos.filter(f => f.acodec && f.acodec !== 'none').sort((a, b) => num(b.abr) - num(a.abr))[0]

    const tipo = melhorV ? 'Vídeo' : melhorA ? 'Áudio' : (d.thumbnails?.length || /\.(jpe?g|png|webp|gif)$/i.test(d.url || '') ? 'Imagem' : 'Arquivo')

    const geral = []
    campo(geral, '📱', 'Plataforma', d.extractor_key && !link.conhecida ? `${link.nome} (${d.extractor_key})` : link.nome)
    campo(geral, '🗂️', 'Tipo', tipo)
    campo(geral, '📝', 'Título', d.title ? String(d.title).slice(0, 120) : null)
    campo(geral, '👤', 'Autor', d.uploader || d.channel || d.creator)
    campo(geral, '⏱️', 'Duração', num(d.duration) > 0 ? duracaoPrecisa(d.duration) : null)
    campo(geral, '📅', 'Publicado em', d.upload_date ? `${d.upload_date.slice(6, 8)}/${d.upload_date.slice(4, 6)}/${d.upload_date.slice(0, 4)}` : null)
    campo(geral, '👁️', 'Visualizações', num(d.view_count) > 0 ? milhar(d.view_count) : null)
    campo(geral, '❤️', 'Curtidas', num(d.like_count) > 0 ? milhar(d.like_count) : null)
    campo(geral, '🧮', 'Formatos oferecidos', formatos.length ? `${formatos.length} (${comVideo.length} com vídeo, ${soAudio.length} só áudio)` : null)

    const v = []
    if (melhorV) {
        campo(v, '🎞️', 'Codec', [nomeCodec(String(melhorV.vcodec).split('.')[0].replace(/^avc1$/, 'h264').replace(/^vp09$/, 'vp9').replace(/^av01$/, 'av1').replace(/^hev1|^hvc1/, 'hevc')), melhorV.vcodec].filter((x, i, a) => x && a.indexOf(x) === i).join(' · '))
        campo(v, '📐', 'Resolução', melhorV.width ? `${melhorV.width}×${melhorV.height} px (${qualityLabel(melhorV.height, melhorV.width) || melhorV.height + 'p'})` : `${melhorV.height}p`)
        campo(v, '🎯', 'FPS', num(melhorV.fps) > 0 ? `${fpsTexto(melhorV.fps)} fps` : null)
        campo(v, '🌈', 'HDR', melhorV.dynamic_range && melhorV.dynamic_range !== 'SDR' ? melhorV.dynamic_range : 'não (SDR)')
        campo(v, '📊', 'Taxa', num(melhorV.vbr || melhorV.tbr) > 0 ? rotuloTaxa(melhorV.vbr || melhorV.tbr) : null)
        campo(v, '📦', 'Contêiner', melhorV.ext ? String(melhorV.ext).toUpperCase() : null)
        const tam = num(melhorV.filesize || melhorV.filesize_approx)
        campo(v, '💾', 'Tamanho do vídeo', tam > 0 ? formatarTamanho(tam) + (melhorV.filesize ? '' : ' (aprox.)') : null)
    }
    const a = []
    if (melhorA) {
        campo(a, '🎵', 'Codec', [nomeCodec(String(melhorA.acodec).split('.')[0].replace(/^mp4a$/, 'aac')), melhorA.acodec].filter((x, i, arr) => x && arr.indexOf(x) === i).join(' · '))
        campo(a, '📊', 'Taxa', num(melhorA.abr) > 0 ? rotuloTaxa(melhorA.abr) : null)
        campo(a, '〰️', 'Amostragem', rotuloAmostragem(melhorA.asr))
        campo(a, '🔊', 'Canais', rotuloCanais(melhorA.audio_channels))
        campo(a, '📦', 'Contêiner', melhorA.ext ? String(melhorA.ext).toUpperCase() : null)
    }
    const thumbs = (d.thumbnails || []).filter(t => num(t.width) > 0).sort((x, y) => num(y.width) * num(y.height) - num(x.width) * num(x.height))
    const capa = []
    if (thumbs[0]) campo(capa, '🖼️', 'Maior capa', `${thumbs[0].width}×${thumbs[0].height} px`)

    return [
        M.cabecalho('🔬', 'Ficha do link'),
        M.secao('🌐', 'Origem', geral),
        M.secao('🎬', 'Melhor vídeo disponível', v),
        M.secao('🎧', 'Melhor áudio disponível', a),
        M.secao('🖼️', 'Capa', capa),
        melhorV || melhorA ? '💡 _É isso que eu baixo: sempre o maior formato que a plataforma oferece._' : '',
        M.assinatura()
    ].filter(Boolean).join('\n\n')
}

/**
 * Baixa a mídia de uma mensagem do WhatsApp direto para um arquivo, sem passar
 * pela memória inteira (vídeo de centenas de MB derrubaria a VPS de 1 núcleo).
 * @param {object} embrulho { key, message } no formato do Baileys
 * @param {object} client   socket, para pedir reenvio de mídia expirada
 * @param {string} destino
 * @param {number} [limiteBytes] corta o download ao passar disso
 */
async function baixarMidiaParaArquivo(embrulho, client, destino, limiteBytes = Infinity) {
    const { downloadMediaMessage } = require('@whiskeysockets/baileys')
    const { pipeline } = require('stream/promises')
    const { Transform } = require('stream')
    const fluxo = await downloadMediaMessage(embrulho, 'stream', {}, {
        logger,
        reuploadRequest: m => client.updateMediaMessage(m)
    })
    // O tamanho que vem na mensagem é o que o REMETENTE declarou; dá para
    // mentir. O teto é conferido nos bytes que chegam de verdade.
    let recebidos = 0
    const teto = new Transform({
        transform(pedaco, _cod, feito) {
            recebidos += pedaco.length
            if (recebidos > limiteBytes) return feito(new Error(`o arquivo passou de ${formatarTamanho(limiteBytes)}`))
            feito(null, pedaco)
        }
    })
    await pipeline(fluxo, teto, fs.createWriteStream(destino))
    return destino
}

module.exports = { fichaDoArquivo, fichaDoLink, lerExif, baixarMidiaParaArquivo }
