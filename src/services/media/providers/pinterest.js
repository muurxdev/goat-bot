/**
 * Pinterest Media Provider
 */

const BaseProvider = require('./baseProvider')
const { PLATFORMS } = require('../constants')

class PinterestProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.PINTEREST)
    }

    match(url) {
        if (!url || typeof url !== 'string') return false
        // Host primeiro: o teste por texto abaixo aceitava "dropbox.com/" como "x.com/".
        if (!require('../plataformas').ehPlataforma(url, 'pinterest')) return false
        const lower = url.toLowerCase()
        return lower.includes('pinterest.com/pin/') || lower.includes('pin.it/')
    }

    normalizeUrl(url) {
        try {
            const parsed = new URL(url)
            return `${parsed.origin}${parsed.pathname}`
        } catch (_) {
            return url
        }
    }
}

module.exports = PinterestProvider

