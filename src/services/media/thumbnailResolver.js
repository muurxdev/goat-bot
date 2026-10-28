/**
 * High-Definition Thumbnail Resolver
 * Garante a maior resolução disponível para capas de mídias (YouTube maxresdefault 1280x720)
 * com fallback gracioso para sddefault (640x480) e hqdefault (480x360).
 */

const logger = require('../../core/logger')
const thumbCache = new Map()

/**
 * Extrai o ID de 11 caracteres de um vídeo do YouTube a partir de URL ou link de thumbnail
 * @param {string} input 
 * @returns {string|null}
 */
function extractYouTubeVideoId(input) {
    if (!input || typeof input !== 'string') return null
    // Se for URL de thumbnail do ytimg
    const ytimgMatch = input.match(/\/vi\/([0-9A-Za-z_-]{11})\//)
    if (ytimgMatch) return ytimgMatch[1]
    // URLs gerais do YouTube
    const match = input.match(/(?:v=|\/|youtu\.be\/|watch\?v=|shorts\/|live\/)([0-9A-Za-z_-]{11})/)
    return match ? match[1] : null
}

/**
 * Resolve a melhor thumbnail disponível no YouTube
 * @param {string} idOrUrl
 * @returns {Promise<string>}
 */
async function getBestYouTubeThumbnail(idOrUrl) {
    const videoId = extractYouTubeVideoId(idOrUrl) || idOrUrl
    if (!videoId || videoId.length !== 11) return idOrUrl

    if (thumbCache.has(videoId)) {
        return thumbCache.get(videoId)
    }

    const maxres = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    const sd = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`
    const hq = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

    // Testa maxresdefault com HEAD rápido
    try {
        const res = await fetch(maxres, { method: 'HEAD', signal: AbortSignal.timeout(2500) })
        if (res.ok && res.status === 200) {
            thumbCache.set(videoId, maxres)
            return maxres
        }
    } catch (errIgnorado) { logger.warn(`[THUMBNAILRESOLVER] Falha ignorada em src/services/media/thumbnailResolver.js:48: ${errIgnorado.message}`) }

    // Fallback 1: sddefault
    try {
        const res = await fetch(sd, { method: 'HEAD', signal: AbortSignal.timeout(1500) })
        if (res.ok && res.status === 200) {
            thumbCache.set(videoId, sd)
            return sd
        }
    } catch (errIgnorado) { logger.warn(`[THUMBNAILRESOLVER] Falha ignorada em src/services/media/thumbnailResolver.js:57: ${errIgnorado.message}`) }

    // Fallback definitivo: hqdefault
    thumbCache.set(videoId, hq)
    return hq
}

/**
 * Tenta melhorar a qualidade de uma thumbnail qualquer
 * @param {string} thumbUrl
 * @returns {Promise<string>}
 */
async function upgradeThumbnail(thumbUrl) {
    if (!thumbUrl || typeof thumbUrl !== 'string') return thumbUrl

    // Se já é maxres, não precisa de nada
    if (thumbUrl.includes('maxresdefault.jpg')) return thumbUrl

    // Se é YouTube ou ytimg
    const videoId = extractYouTubeVideoId(thumbUrl)
    if (videoId) {
        return await getBestYouTubeThumbnail(videoId)
    }

    return thumbUrl
}

module.exports = {
    extractYouTubeVideoId,
    getBestYouTubeThumbnail,
    upgradeThumbnail
}

