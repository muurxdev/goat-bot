/**
 * Generic Media Provider (Fallback para URLs web suportadas por yt-dlp)
 */

const BaseProvider = require('./baseProvider')
const { PLATFORMS } = require('../constants')

class GenericProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.GENERIC)
    }

    match(url) {
        if (!url || typeof url !== 'string') return false
        return url.startsWith('http://') || url.startsWith('https://')
    }
}

module.exports = GenericProvider

