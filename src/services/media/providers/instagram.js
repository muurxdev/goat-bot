/**
 * Instagram Media Provider (Reels, Posts, Galerias)
 */

const BaseProvider = require('./baseProvider')
const { PLATFORMS } = require('../constants')

class InstagramProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.INSTAGRAM)
    }

    match(url) {
        if (!url || typeof url !== 'string') return false
        // Host primeiro: o teste por texto abaixo aceitava "dropbox.com/" como "x.com/".
        if (!require('../plataformas').ehPlataforma(url, 'instagram')) return false
        const lower = url.toLowerCase()
        return (
            lower.includes('instagram.com/reel/') ||
            lower.includes('instagram.com/p/') ||
            lower.includes('instagram.com/tv/') ||
            lower.includes('instagram.com/reels/') ||
            lower.includes('instagr.am/')
        )
    }

    normalizeUrl(url) {
        try {
            const parsed = new URL(url)
            // Remove todos os parâmetros de rastreamento do Instagram (igsh, etc)
            return `${parsed.origin}${parsed.pathname}`
        } catch (_) {
            return url
        }
    }
}

module.exports = InstagramProvider

