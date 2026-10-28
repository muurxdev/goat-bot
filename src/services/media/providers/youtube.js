/**
 * YouTube Media Provider
 */

const BaseProvider = require('./baseProvider')
const { PLATFORMS } = require('../constants')

class YouTubeProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.YOUTUBE)
    }

    match(url) {
        if (!url || typeof url !== 'string') return false
        const lower = url.toLowerCase()
        return (
            lower.includes('youtube.com/watch') ||
            lower.includes('youtu.be/') ||
            lower.includes('youtube.com/shorts/') ||
            lower.includes('youtube.com/live/') ||
            lower.includes('music.youtube.com/')
        )
    }

    normalizeUrl(url) {
        try {
            const parsed = new URL(url)
            // Para youtu.be/ID -> extrai o ID
            if (parsed.hostname.includes('youtu.be')) {
                const videoId = parsed.pathname.slice(1)
                return `https://www.youtube.com/watch?v=${videoId}`
            }
            // Para shorts -> normaliza para watch?v=
            if (parsed.pathname.includes('/shorts/')) {
                const videoId = parsed.pathname.split('/shorts/')[1].split('?')[0]
                return `https://www.youtube.com/watch?v=${videoId}`
            }
            // Mantém apenas o parâmetro 'v' do watch
            if (parsed.searchParams.has('v')) {
                const v = parsed.searchParams.get('v')
                return `https://www.youtube.com/watch?v=${v}`
            }
            return super.normalizeUrl(url)
        } catch (_) {
            return url
        }
    }
}

module.exports = YouTubeProvider

