/**
 * Media Resolver & Security Validator
 */

const { spawn } = require('child_process')
const YouTubeProvider = require('./providers/youtube')
const InstagramProvider = require('./providers/instagram')
const TikTokProvider = require('./providers/tiktok')
const KwaiProvider = require('./providers/kwai')
const TwitterProvider = require('./providers/twitter')
const RedditProvider = require('./providers/reddit')
const PinterestProvider = require('./providers/pinterest')
const GenericProvider = require('./providers/generic')
const { MEDIA_ERRORS, MEDIA_LIMITS, PLATFORMS } = require('./constants')
const { buildYtDlpArgs, getYtDlpEnv } = require('./mediaArgs')
const { toMessage, isMissingBinary } = require('./mediaErrors')
const logger = require('../../core/logger')

const providers = [
    new YouTubeProvider(),
    new InstagramProvider(),
    new TikTokProvider(),
    new KwaiProvider(),
    new TwitterProvider(),
    new RedditProvider(),
    new PinterestProvider(),
    new GenericProvider()
]

/**
 * Detecta se uma string parece ser uma URL/compartilhamento sem exigir o protocolo.
 * Aceita formas como: "youtu.be/abc", "vm.tiktok.com/xxxx", "www.instagram.com/p/xxx",
 * "https://..." (com ou sem protocolo). Strings de busca com espaços não são URLs.
 * @param {string} input
 * @returns {boolean}
 */
function looksLikeUrl(input) {
    if (!input || typeof input !== 'string') return false
    const candidate = input.trim()
    if (!candidate) return false
    // Nunca trata como URL algo que contenha espaços (ex: nome de música)
    if (/\s/.test(candidate)) return false

    // Já com protocolo
    if (/^https?:\/\/[^\s]+$/i.test(candidate)) return true

    // Domínio + caminho (sem protocolo) — ex: www.youtube.com/watch?v=..., youtu.be/ID
    return /^([\w-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i.test(candidate)
}

/**
 * Normaliza a entrada adicionando o protocolo https:// a domínios "puros"
 * (ex: "vm.tiktok.com/abc" -> "https://vm.tiktok.com/abc")
 * @param {string} input
 * @returns {string}
 */
function normalizeInput(input) {
    if (!input || typeof input !== 'string') return input
    const candidate = input.trim()
    if (!looksLikeUrl(candidate)) return input
    if (/^https?:\/\//i.test(candidate)) return candidate
    return `https://${candidate}`
}

/**
 * Valida a URL contra ataques SSRF, protocolos inseguros e URLs maliciosas
 * @param {string} urlString
 * @returns {boolean}
 */
function validateUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') return false

    // Tolerância a links "puros" (sem protocolo) — normaliza antes de validar
    const candidate = normalizeInput(urlString)

    try {
        const parsed = new URL(candidate)

        // Protocolo estrito
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return false
        }

        // Endereço interno (Prevenção SSRF): a conferência de verdade mora em
        // urlSeguro.hostInterno. A lista antiga comparava TEXTO e deixava passar
        // 127.0.0.2, "[::1]" (o parser guarda IPv6 entre colchetes), 169.254.x,
        // e os nomes dos containers vizinhos na VPS (bgutil_pot_provider,
        // goat_whisper), que não têm ponto e resolvem para IP interno.
        return !require('./urlSeguro').hostInterno(parsed.hostname)
    } catch (err) {
        logger.debug(`[MEDIA RESOLVER] Link ilegível "${String(urlString).slice(0, 80)}": ${err.message}`)
        return false
    }
}

/**
 * Detecta a plataforma a partir de uma URL
 * @param {string} url
 * @returns {string|null}
 */
function detectPlatform(url) {
    const normalized = normalizeInput(url || '')
    if (!validateUrl(normalized)) return null

    for (const provider of providers) {
        if (provider.name !== PLATFORMS.GENERIC && provider.match(normalized)) {
            return provider.name
        }
    }

    return PLATFORMS.GENERIC
}

/**
 * Encontra o provedor responsável pela URL
 * @param {string} url
 * @returns {BaseProvider}
 */
function resolveProvider(url) {
    const normalized = normalizeInput(url || '')
    for (const provider of providers) {
        if (provider.match(normalized)) {
            return provider
        }
    }
    return providers[providers.length - 1] // GenericProvider
}

/**
 * Normaliza a URL utilizando o provedor específico
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
    const normalized = normalizeInput(url || '')
    if (!validateUrl(normalized)) return url
    const provider = resolveProvider(normalized)
    return provider.normalizeUrl(normalized)
}

/**
 * Helper: detecta se a URL é do YouTube (qualquer formato)
 */
function isYouTubeUrl(target) {
    return /youtu(\.be|be\.com)/i.test(target)
}

/**
 * Helper: aciona fallback oEmbed ou yt-search quando yt-dlp falha
 */
async function tryYouTubeFallback(target, isSearch, urlOrQuery) {
    try {
        const { resolveYouTubeOEmbed } = require('./youtubeFallback')
        let fallbackMeta = null

        if (isYouTubeUrl(target)) {
            fallbackMeta = await resolveYouTubeOEmbed(target)
        } else if (isSearch || !target.startsWith('http')) {
            const yts = require('yt-search')
            const cleanQuery = urlOrQuery.replace(/^ytsearch\d*:/i, '').trim()
            const r = await yts(cleanQuery)
            if (r && r.videos && r.videos.length > 0) {
                // NAO pegar videos[0]: a ordem do YouTube ignora o artista que o
                // usuario digitou e ja trouxe musica estrangeira no lugar da
                // faixa pedida. O ranqueador pontua o casamento com o canal.
                const { melhorResultado } = require('./searchRanker')
                const candidatos = r.videos.slice(0, 25).map(x => ({
                    id: x.videoId,
                    title: x.title,
                    author: (x.author && x.author.name) || 'Desconhecido',
                    duration: x.seconds || 0,
                    views: x.views || 0,
                    thumbnail: x.thumbnail,
                    url: x.url
                }))
                const { escolhido, confiante } = melhorResultado(cleanQuery, candidatos)
                const v = {
                    videoId: escolhido.id,
                    title: escolhido.title,
                    author: { name: escolhido.author },
                    thumbnail: escolhido.thumbnail,
                    url: escolhido.url,
                    seconds: escolhido.duration,
                    timestamp: null
                }
                logger.info(`[MEDIA RESOLVER] Busca "${cleanQuery}" -> "${escolhido.title}" ` +
                    `(${escolhido.author}) score ${escolhido._score}${confiante ? '' : ' [BAIXA CONFIANCA]'}`)
                fallbackMeta = {
                    id: v.videoId,
                    title: v.title,
                    author: v.author && v.author.name ? v.author.name : 'Desconhecido',
                    thumbnail: v.thumbnail,
                    url: v.url,
                    duration: v.seconds || 0,
                    durationFormatted: v.timestamp || '—'
                }
            }
        }

        if (fallbackMeta && fallbackMeta.title && fallbackMeta.title !== 'Vídeo do YouTube') {
            logger.info(`[MEDIA RESOLVER] Metadados do YouTube via fallback: ${fallbackMeta.title}`)
            const { upgradeThumbnail } = require('./thumbnailResolver')
            const bestThumb = await upgradeThumbnail(fallbackMeta.thumbnail || fallbackMeta.id)
            return {
                id: fallbackMeta.id || null,
                title: fallbackMeta.title,
                author: fallbackMeta.author || 'YouTube',
                duration: fallbackMeta.duration || 0,
                durationFormatted: fallbackMeta.durationFormatted || '—',
                thumbnail: bestThumb || fallbackMeta.thumbnail || null,
                url: fallbackMeta.url || target,
                webpageUrl: fallbackMeta.url || target,
                platform: PLATFORMS.YOUTUBE
            }
        }
    } catch (fbErr) {
        logger.warn(`[MEDIA RESOLVER] Fallback YouTube falhou: ${fbErr.message}`)
    }
    return null
}

/**
 * Extrai metadados completos de forma segura via yt-dlp, com fallback resiliente para YouTube
 * @param {string} urlOrQuery
 * @param {object|boolean} options  - aceita { isSearch, timeoutMs } ou boolean (legado)
 * @returns {Promise<object>}
 */
async function extractMetadata(urlOrQuery, options) {
    const opts = (typeof options === 'boolean')
        ? { isSearch: options }
        : (options && typeof options === 'object' ? options : {})
    const isSearch = opts.isSearch === true
    const timeoutMs = opts.timeoutMs || MEDIA_LIMITS.METADATA_TIMEOUT_MS
    const userJid = opts.userJid || null

    // Link: confere para onde o nome RESOLVE antes de o yt-dlp sair buscando.
    // O validateUrl olha só o texto; um domínio público apontando para IP
    // interno (127.0.0.1.nip.io) passava e o yt-dlp acessava a rede da VPS.
    if (!isSearch && /^https?:\/\//i.test(String(urlOrQuery || '').trim())) {
        const { urlSeguraResolvida } = require('./urlSeguro')
        if (!(await urlSeguraResolvida(String(urlOrQuery).trim()))) {
            const err = new Error('Esse link aponta para um endereço interno, que eu não acesso.')
            err.code = MEDIA_ERRORS.SECURITY_VIOLATION
            throw err
        }
    }

    // Se for URL do YouTube, tenta oEmbed primeiro sem precisar de yt-dlp
    if (!isSearch && isYouTubeUrl(urlOrQuery)) {
        const { resolveYouTubeOEmbed } = require('./youtubeFallback')
        const oembedMeta = await resolveYouTubeOEmbed(urlOrQuery)
        if (oembedMeta && oembedMeta.title && oembedMeta.title !== 'Vídeo do YouTube') {
            logger.info(`[MEDIA RESOLVER] Metadados YouTube via oEmbed (rápido): ${oembedMeta.title} (${oembedMeta.durationFormatted || '—'})`)
            return {
                id: oembedMeta.id,
                title: oembedMeta.title,
                author: oembedMeta.author || 'YouTube',
                duration: oembedMeta.duration || 0,
                durationFormatted: oembedMeta.durationFormatted || '—',
                thumbnail: oembedMeta.thumbnail,
                url: oembedMeta.url,
                webpageUrl: oembedMeta.url,
                uploadDate: oembedMeta.uploadDate || null,
                views: oembedMeta.views || 0,
                platform: PLATFORMS.YOUTUBE
            }
        }
    }

    return new Promise((resolve, reject) => {
        let resolved = false
        const safeResolve = (val) => { if (!resolved) { resolved = true; resolve(val) } }
        const safeReject = (err) => { if (!resolved) { resolved = true; reject(err) } }

        let target = urlOrQuery
        let provider = null

        if (!isSearch && validateUrl(urlOrQuery)) {
            target = normalizeUrl(urlOrQuery)
            provider = resolveProvider(target)
        } else {
            target = urlOrQuery.startsWith('ytsearch') ? urlOrQuery : `ytsearch1:${urlOrQuery}`
            provider = providers[0] // YouTubeProvider
        }

        const isYT = (provider && provider.name === PLATFORMS.YOUTUBE) || isYouTubeUrl(target) || isSearch

        const args = buildYtDlpArgs([
            '--dump-single-json',
            '--no-warnings',
            '--no-playlist',
            '--skip-download',
            target
        ], { userJid })

        let proc
        try {
            proc = spawn('yt-dlp', args, { env: getYtDlpEnv() })
        } catch (spawnErr) {
            // Falha síncrona ao criar processo (raro)
            if (isYT) {
                tryYouTubeFallback(target, isSearch, urlOrQuery).then(fb => {
                    if (fb) return safeResolve(fb)
                    const e = new Error('yt-dlp não encontrado no ambiente (PATH do processo).')
                    e.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
                    safeReject(e)
                }).catch(() => {
                    const e = new Error('yt-dlp não encontrado no ambiente (PATH do processo).')
                    e.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
                    safeReject(e)
                })
                return
            }
            const e = new Error(`Falha ao iniciar o yt-dlp: ${spawnErr.message}`)
            e.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            return safeReject(e)
        }

        let stdoutData = ''
        let stderrData = ''

        proc.on('error', async spawnErr => {
            clearTimeout(timer)
            logger.error(`[MEDIA RESOLVER] Falha ao iniciar yt-dlp: ${spawnErr.message}`)
            if (isYT) {
                const fb = await tryYouTubeFallback(target, isSearch, urlOrQuery)
                if (fb) return safeResolve(fb)
            }
            const e = new Error(isMissingBinary(spawnErr)
                ? 'yt-dlp não encontrado no ambiente (PATH do processo).'
                : `Falha ao iniciar yt-dlp: ${spawnErr.message}`)
            e.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            safeReject(e)
        })

        proc.stdout.on('data', chunk => { stdoutData += chunk.toString() })
        proc.stderr.on('data', chunk => { stderrData += chunk.toString() })

        const timer = setTimeout(() => {
            proc.kill()
            const e = new Error('Tempo limite de análise de mídia excedido')
            e.code = MEDIA_ERRORS.TIMEOUT
            safeReject(e)
        }, timeoutMs)

        proc.on('close', async code => {
            clearTimeout(timer)

            if (code !== 0 || !stdoutData.trim()) {
                logger.warn(`[MEDIA RESOLVER] Falha extração metadados (código ${code}): ${stderrData.slice(0, 120) || 'sem stderr'}`)
                if (isYT) {
                    const fb = await tryYouTubeFallback(target, isSearch, urlOrQuery)
                    if (fb) return safeResolve(fb)
                }
                const e = new Error(toMessage('Mídia não encontrada ou indisponível.', stderrData))
                e.code = MEDIA_ERRORS.MEDIA_NOT_FOUND
                return safeReject(e)
            }

            try {
                const rawJson = JSON.parse(stdoutData)
                const normalized = provider.normalizeMetadata(rawJson, target)
                if (!normalized) {
                    const e = new Error('Nenhum resultado encontrado.')
                    e.code = MEDIA_ERRORS.NO_RESULTS
                    return safeReject(e)
                }
                if (normalized.thumbnail && (provider.name === PLATFORMS.YOUTUBE || isYT)) {
                    try {
                        const { upgradeThumbnail } = require('./thumbnailResolver')
                        normalized.thumbnail = await upgradeThumbnail(normalized.thumbnail)
                    } catch (errIgnorado) { logger.warn(`[MEDIARESOLVER] Falha ignorada em src/services/media/mediaResolver.js:372: ${errIgnorado.message}`) }
                }
                if (normalized.duration > MEDIA_LIMITS.MAX_DURATION_SECONDS) {
                    const e = new Error(`Duração da mídia (${normalized.durationFormatted}) excede o limite máximo de ${MEDIA_LIMITS.MAX_DURATION_SECONDS / 60} minutos.`)
                    e.code = MEDIA_ERRORS.DURATION_TOO_LONG
                    return safeReject(e)
                }
                safeResolve(normalized)
            } catch (jsonErr) {
                const e = new Error('Falha ao processar estrutura de metadados da mídia.')
                e.code = MEDIA_ERRORS.PROCESSING_FAILED
                safeReject(e)
            }
        })
    })
}

module.exports = {
    validateUrl,
    looksLikeUrl,
    normalizeInput,
    detectPlatform,
    resolveProvider,
    normalizeUrl,
    extractMetadata,
    providers
}

