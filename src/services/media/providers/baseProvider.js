/**
 * Base Media Provider Interface
 */

class BaseProvider {
    constructor(platformName) {
        this.name = platformName
    }

    /**
     * Verifica se a URL corresponde a este provedor
     * @param {string} url
     * @returns {boolean}
     */
    match(url) {
        throw new Error('Método match(url) deve ser implementado')
    }

    /**
     * Normaliza a URL removendo parâmetros supérfluos de rastreamento
     * @param {string} url
     * @returns {string}
     */
    normalizeUrl(url) {
        try {
            const parsed = new URL(url)
            // Remove parâmetros comuns de tracking
            const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'si', 'fbclid', 'igsh']
            trackingParams.forEach(p => parsed.searchParams.delete(p))
            return parsed.toString()
        } catch (_) {
            return url
        }
    }

    /**
     * Transforma os metadados brutos do yt-dlp em estrutura padrão normalizada
     * @param {object} raw
     * @param {string} originalUrl
     * @returns {object}
     */
    normalizeMetadata(raw, originalUrl) {
        const entry = raw.entries ? raw.entries[0] : raw
        if (!entry) return null

        // Detecta se é galeria com múltiplos itens
        const isGallery = Array.isArray(entry.entries) && entry.entries.length > 1

        let galleryItems = []
        if (isGallery) {
            galleryItems = entry.entries.map((item, idx) => ({
                id: item.id || `item_${idx}`,
                url: item.url || item.webpage_url,
                thumbnail: item.thumbnail || (item.thumbnails?.[0]?.url),
                type: item.ext === 'mp4' || item.vcodec ? 'video' : 'image',
                duration: item.duration || 0
            }))
        }

        return {
            id: entry.id || `${Date.now()}`,
            title: entry.title || 'Mídia sem título',
            author: entry.uploader || entry.channel || entry.creator || entry.artist || 'Desconhecido',
            channelUrl: entry.uploader_url || entry.channel_url || null,
            duration: entry.duration || 0,
            durationFormatted: this.formatDuration(entry.duration || 0),
            thumbnail: entry.thumbnail || (entry.thumbnails?.[entry.thumbnails.length - 1]?.url) || null,
            webpageUrl: entry.webpage_url || entry.url || originalUrl,
            description: (entry.description || '').slice(0, 300),
            uploadDate: entry.upload_date || entry.timestamp || entry.release_timestamp || entry.release_date || entry.created_at || entry.date || null,
            year: entry.release_year || (entry.upload_date ? String(entry.upload_date).slice(0, 4) : (entry.timestamp ? String(new Date(Number(entry.timestamp) * 1000).getFullYear()) : null)),
            viewCount: entry.view_count || 0,
            likeCount: entry.like_count || 0,
            platform: this.name,
            type: isGallery ? 'gallery' : (entry.vcodec && entry.vcodec !== 'none' ? 'video' : 'audio'),
            galleryItems,
            formatsAvailable: this.extractAvailableFormats(entry)
        }
    }

    extractAvailableFormats(entry) {
        if (!entry.formats || !Array.isArray(entry.formats)) return []
        const qualities = new Set()
        entry.formats.forEach(f => {
            if (f.height) qualities.add(`${f.height}p`)
        })
        return Array.from(qualities).sort((a, b) => parseInt(b) - parseInt(a))
    }

    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        const hours = Math.floor(mins / 60)
        if (hours > 0) {
            const remMins = mins % 60
            return `${String(hours).padStart(2, '0')}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        }
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
}

module.exports = BaseProvider

