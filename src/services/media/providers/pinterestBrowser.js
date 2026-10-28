/**
 * Pinterest via Chromium (headless) — resolve LIVE WALLPAPERS e vídeos na maior
 * qualidade, navegando a página real (o Pinterest carrega o vídeo por JS, então o
 * fetch de HTML puro costuma falhar/pegar baixa qualidade).
 *
 * Usa `puppeteer-core` + um Chromium do sistema (CHROMIUM_PATH; sem ela, o Docker
 * usa /usr/bin/chromium e o Windows usa o Chrome ou o Edge instalado). É TOLERANTE: se o puppeteer/Chromium não existir, lança
 * BROWSER_UNAVAILABLE e o chamador cai no método fetch tradicional. Nada quebra
 * quando o navegador não está presente (ex.: ambiente local sem Chromium).
 */

const fs = require('fs')
const logger = require('../../../core/logger')

const path = require('path')

// Onde o Chrome e o Edge se instalam no Windows, na ordem de preferência.
function navegadoresDoWindows() {
    const bases = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean)
    const relativos = [['Google', 'Chrome', 'Application', 'chrome.exe'], ['Microsoft', 'Edge', 'Application', 'msedge.exe']]
    return relativos.flatMap(partes => bases.map(base => path.join(base, ...partes)))
}

// Lido a cada uso, não no carregamento: assim CHROMIUM_PATH trocado em tempo de
// execução (testes, .env recarregado) vale na hora.
function chromiumPath() {
    const definido = process.env.CHROMIUM_PATH || process.env.PUPPETEER_EXECUTABLE_PATH
    if (definido) return definido
    if (process.platform === 'win32') {
        return navegadoresDoWindows().find(p => fs.existsSync(p)) || 'chrome.exe'
    }
    return '/usr/bin/chromium'
}

/** Pinterest desativado explicitamente? (para desligar sem remover código) */
function browserDisabled() {
    return String(process.env.PINTEREST_BROWSER || '').toLowerCase() === 'off'
}

/**
 * Escolhe a MELHOR URL de vídeo entre as capturadas na rede.
 * Prefere .mp4 de v.pinimg.com com maior resolução no path (ex.: /720p/, /1080p/),
 * ignorando HLS (.m3u8). Puro/testável.
 * @param {string[]} urls
 * @returns {string|null}
 */
function pickBestVideo(urls) {
    const mp4s = (urls || []).filter(u => /\.mp4(\?|$)/i.test(u) && !/\.m3u8/i.test(u))
    if (!mp4s.length) return null
    const score = (u) => {
        const m = u.match(/\/(\d{3,4})p\//) || u.match(/_(\d{3,4})[wx]/i) || u.match(/(\d{3,4})x(\d{3,4})/)
        if (m) return parseInt(m[1], 10) || 0
        if (/\/720p\//.test(u)) return 720
        if (/originals|expmp4/i.test(u)) return 2000 // "originals"/expandido = melhor
        return 480
    }
    return mp4s.slice().sort((a, b) => score(b) - score(a))[0]
}

/**
 * Converte um cookies.txt (formato Netscape) em objetos de cookie do puppeteer.
 * Puro/testável.
 * @param {string} content
 * @returns {Array<{name,value,domain,path,secure,expires}>}
 */
function parseNetscapeCookies(content) {
    const out = []
    if (!content || typeof content !== 'string') return out
    for (const raw of content.split('\n')) {
        const line = raw.trim()
        if (!line || line.startsWith('#')) continue
        const c = line.split('\t')
        if (c.length < 7) continue
        const [domain, , cpath, secure, expiry, name, value] = c
        if (!domain || !name) continue
        out.push({
            name, value,
            domain: domain.replace(/^#HttpOnly_/, ''),
            path: cpath || '/',
            secure: String(secure).toUpperCase() === 'TRUE',
            expires: Number(expiry) || undefined
        })
    }
    return out
}

let _puppeteer
function loadPuppeteer() {
    if (_puppeteer !== undefined) return _puppeteer
    try {
        _puppeteer = require('puppeteer-core')
    } catch (_) {
        try { _puppeteer = require('puppeteer') } catch (_2) { _puppeteer = null }
    }
    return _puppeteer
}

/**
 * Navega uma URL do Pinterest e resolve a mídia de maior qualidade.
 * @param {string} url
 * @param {{cookiesPath?:string, timeoutMs?:number}} [opts]
 * @returns {Promise<{videoUrl?:string, imageUrl?:string, title?:string, author?:string}>}
 */
async function resolvePinterestMedia(url, opts = {}) {
    if (browserDisabled()) { const e = new Error('BROWSER_DISABLED'); e.code = 'BROWSER_UNAVAILABLE'; throw e }
    const puppeteer = loadPuppeteer()
    if (!puppeteer) { const e = new Error('puppeteer/Chromium indisponível'); e.code = 'BROWSER_UNAVAILABLE'; throw e }
    const executavel = chromiumPath()
    if (!fs.existsSync(executavel) && !process.env.PUPPETEER_EXECUTABLE_PATH) {
        const e = new Error('Chromium não encontrado em ' + executavel); e.code = 'BROWSER_UNAVAILABLE'; throw e
    }

    const timeoutMs = opts.timeoutMs || 45000
    let browser
    try {
        browser = await puppeteer.launch({
            executablePath: executavel,
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--mute-audio']
        })
        const page = await browser.newPage()
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')

        // Cookies (global/usuário) para pins que exigem sessão
        if (opts.cookiesPath && fs.existsSync(opts.cookiesPath)) {
            try {
                const cookies = parseNetscapeCookies(fs.readFileSync(opts.cookiesPath, 'utf8'))
                    .filter(c => /pinterest|pinimg/i.test(c.domain))
                if (cookies.length) await page.setCookie(...cookies)
            } catch (e) { logger.warn(`[PINTEREST BROWSER] cookies: ${e.message}`) }
        }

        // Captura URLs de vídeo que passam pela rede (é onde o mp4 real aparece)
        const videoUrls = new Set()
        page.on('response', (res) => {
            const u = res.url()
            if (/v\.pinimg\.com\/videos\/.+\.mp4/i.test(u) || /\.mp4(\?|$)/i.test(u)) videoUrls.add(u)
        })

        await page.goto(url, { waitUntil: 'networkidle2', timeout: timeoutMs })
        // dá um tempo para o player iniciar e disparar o request do vídeo
        try { await page.waitForResponse(r => /v\.pinimg\.com\/videos\/.+\.mp4/i.test(r.url()), { timeout: 8000 }) } catch (errIgnorado) { logger.warn(`[PINTERESTBROWSER] Falha ignorada em src/services/media/providers/pinterestBrowser.js:142: ${errIgnorado.message}`) }

        const meta = await page.evaluate(() => {
            const get = (sel) => document.querySelector(sel)?.getAttribute('content') || null
            // varre <video>/<source> também
            const vids = Array.from(document.querySelectorAll('video, video source'))
                .map(v => v.src || v.getAttribute('src')).filter(Boolean)
            return {
                title: get('meta[property="og:title"]') || document.title || null,
                ogVideo: get('meta[property="og:video"]'),
                ogImage: get('meta[property="og:image"]'),
                domVideos: vids
            }
        })

        const allVideos = [...videoUrls, meta.ogVideo, ...(meta.domVideos || [])].filter(Boolean)
        const videoUrl = pickBestVideo(allVideos)
        let imageUrl = meta.ogImage
        if (imageUrl && imageUrl.includes('/736x/')) imageUrl = imageUrl.replace('/736x/', '/originals/')

        return {
            videoUrl: videoUrl || undefined,
            imageUrl: imageUrl || undefined,
            title: (meta.title || '').replace(/\s*\|\s*Pinterest$/i, '').trim() || undefined
        }
    } finally {
        if (browser) { try { await browser.close() } catch (errIgnorado) { logger.warn(`[PINTERESTBROWSER] Falha ignorada em src/services/media/providers/pinterestBrowser.js:168: ${errIgnorado.message}`) } }
    }
}

module.exports = { resolvePinterestMedia, pickBestVideo, parseNetscapeCookies, browserDisabled, chromiumPath }
