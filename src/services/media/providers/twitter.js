/**
 * Twitter / X Media Provider (Twitsave API)
 * Download de vídeos do Twitter/X em alta resolução
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const BaseProvider = require('./baseProvider')
const { PLATFORMS } = require('../constants')
const { tempDir } = require('../../../config/paths')
const logger = require('../../../core/logger')

async function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
            let data = ''
            res.on('data', chunk => { data += chunk })
            res.on('end', () => resolve(data))
        }).on('error', reject)
    })
}

async function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url)
        const client = parsed.protocol === 'https:' ? https : http
        client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, destPath).then(resolve).catch(reject)
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Falha ao baixar vídeo do Twitter (HTTP ${res.statusCode})`))
            }
            const fileStream = fs.createWriteStream(destPath)
            res.pipe(fileStream)
            fileStream.on('finish', () => {
                fileStream.close(() => resolve(destPath))
            })
            fileStream.on('error', reject)
        }).on('error', reject)
    })
}

async function downloadTwitterVideo(twitterUrl) {
    const cleanUrl = twitterUrl.trim()
    const twitsaveUrl = `https://twitsave.com/info?url=${encodeURIComponent(cleanUrl)}`

    const html = await fetchHTML(twitsaveUrl)

    // Extrai links e pontua pela resolução real indicada no texto e contexto do HTML no Twitsave
    const linkRegex = /<a\s+[^>]*href="([^"]*(?:twitsave\.com\/download|\.mp4)[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
    const itens = []
    let match
    while ((match = linkRegex.exec(html)) !== null) {
        const urlLink = match[1]
        const textoLink = match[2]
        const inicio = Math.max(0, match.index - 200)
        const fim = Math.min(html.length, match.index + match[0].length + 200)
        const contexto = (html.slice(inicio, fim) + ' ' + textoLink + ' ' + urlLink).toLowerCase()

        let score = 50
        if (/2160|4k|uhd/i.test(contexto)) score = 900
        else if (/1440|2k/i.test(contexto)) score = 700
        else if (/1080|fhd/i.test(contexto)) score = 500
        else if (/720|hd/i.test(contexto)) score = 300
        else if (/480|sd/i.test(contexto)) score = 100
        else if (/360|240/i.test(contexto)) score = 10

        itens.push({ url: urlLink, score })
    }

    if (itens.length === 0) {
        const directVideoMatches = [...html.matchAll(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/gi)]
        for (const m of directVideoMatches) {
            itens.push({ url: m[0], score: 50 })
        }
    }

    itens.sort((a, b) => b.score - a.score)
    let videoDownloadUrl = itens[0]?.url
    const melhorScore = itens[0]?.score || 0

    const videoTempDir = path.join(tempDir, 'twitter')
    if (!fs.existsSync(videoTempDir)) {
        fs.mkdirSync(videoTempDir, { recursive: true })
    }

    const jobId = `twitter_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const outputPath = path.join(videoTempDir, `${jobId}.mp4`)

    // Se twitsave não encontrou ou a melhor resolução foi baixa (<720p), tenta yt-dlp para qualidade máxima
    if (!videoDownloadUrl || melhorScore < 300) {
        try {
            const { spawn } = require('child_process');
            let getYtDlpEnv;
            try { getYtDlpEnv = require('../mediaArgs').getYtDlpEnv; } catch (_) { getYtDlpEnv = () => process.env; }
            // O X entrega vídeo em HLS (centenas de fragmentos). Um por vez, um vídeo de 3 min levava
            // mais de 4 min e o pedido parecia travado: 8 em paralelo, teto de 10 min e a mesma
            // altura máxima dos outros downloads (servidor pequeno não converte 4K).
            const { MEDIA_LIMITS } = require('../constants')
            const teto = MEDIA_LIMITS.MAX_VIDEO_HEIGHT
            await new Promise((resolve, reject) => {
                const proc = spawn('yt-dlp', [
                    '--no-playlist',
                    '--no-warnings',
                    // Sem isto o yt-dlp escreve o andamento em stdout. Como ninguém lia o pipe, ele
                    // enchia (64 KB) e o yt-dlp parava no meio do download, para sempre: era o que
                    // prendia o vídeo do X (medido na VPS: 3 s direto, 240 s dentro do bot).
                    '--quiet', '--no-progress',
                    '--concurrent-fragments', '8',
                    '-f', 'bv*+ba/b',
                    '-S', teto < 2160 ? `res:${teto},fps` : 'res,fps',
                    '--merge-output-format', 'mp4',
                    '-o', outputPath,
                    cleanUrl
                ], { env: getYtDlpEnv(), stdio: ['ignore', 'ignore', 'ignore'] });
                const limite = setTimeout(() => {
                    try { proc.kill('SIGKILL') } catch (errKill) { logger.warn(`[TWITTER] yt-dlp não morreu no tempo limite: ${errKill.message}`) }
                    reject(new Error('o yt-dlp passou de 10 min no X'))
                }, 10 * 60 * 1000);
                proc.on('close', c => {
                    clearTimeout(limite);
                    return (c === 0 && fs.existsSync(outputPath)) ? resolve() : reject(new Error(`código ${c}`));
                });
                proc.on('error', err => { clearTimeout(limite); reject(err) });
            });

            return {
                filePath: outputPath,
                title: 'Vídeo do Twitter / X',
                author: 'Twitter User',
                durationFormatted: '—',
                thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600',
                url: cleanUrl,
                uploadDate: null,
                year: null
            };
        } catch (_) {
            // Se yt-dlp falhou e havia videoDownloadUrl, usa o que tinha
            if (!videoDownloadUrl) {
                throw new Error('Nenhum vídeo em alta resolução encontrado neste link do Twitter / X.');
            }
        }
    }

    const titleMatch = html.match(/<p class="[^"]*text-gray-800[^"]*">([^<]+)<\/p>/)
    const authorMatch = html.match(/<h2 class="[^"]*font-bold[^"]*">([^<]+)<\/h2>/)
    const dateMatch = html.match(/datetime="([^"]+)"/i) || html.match(/(\d{1,2}\s+[A-Za-z]{3},\s+\d{4})/i)
    const uploadDate = dateMatch ? dateMatch[1] : null
    const year = uploadDate ? (new Date(uploadDate).getFullYear() || null) : null

    await downloadFile(videoDownloadUrl, outputPath)

    return {
        filePath: outputPath,
        title: titleMatch ? titleMatch[1].trim() : 'Vídeo do Twitter / X',
        author: authorMatch ? authorMatch[1].trim() : 'Twitter User',
        durationFormatted: '—',
        thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600',
        url: cleanUrl,
        uploadDate,
        year: year ? String(year) : null
    }
}

class TwitterProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.TWITTER)
    }

    match(url) {
        if (!url || typeof url !== 'string') return false
        // Host primeiro: o teste por texto abaixo aceitava "dropbox.com/" como "x.com/".
        if (!require('../plataformas').ehPlataforma(url, 'twitter')) return false
        const lower = url.toLowerCase()
        return lower.includes('twitter.com/') || lower.includes('x.com/')
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

TwitterProvider.downloadTwitterVideo = downloadTwitterVideo

module.exports = TwitterProvider
module.exports.downloadTwitterVideo = downloadTwitterVideo
