/**
 * Reddit Media Provider
 */

const BaseProvider = require('./baseProvider')
const { PLATFORMS } = require('../constants')

class RedditProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.REDDIT)
    }

    match(url) {
        if (!url || typeof url !== 'string') return false
        // Host primeiro: o teste por texto abaixo aceitava "dropbox.com/" como "x.com/".
        if (!require('../plataformas').ehPlataforma(url, 'reddit')) return false
        const lower = url.toLowerCase()
        return (
            lower.includes('reddit.com/r/') ||
            lower.includes('redd.it/')
        )
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

module.exports = RedditProvider

