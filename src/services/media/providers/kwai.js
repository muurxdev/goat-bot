/**
 * Kwai Media Provider & Direct Downloader
 * Download de vídeos e carrosséis do Kwai em alta resolução sem falhas
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const BaseProvider = require("./baseProvider");
const { PLATFORMS } = require("../constants");
const { tempDir } = require("../../../config/paths");
const logger = require("../../../core/logger");

async function downloadFile(url, destPath, headers = {}) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const client = parsed.protocol === "https:" ? https : http;
        client.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Referer": "https://www.kwai.com/",
                ...headers
            }
        }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadFile(res.headers.location, destPath, headers).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error("Falha ao baixar vídeo do Kwai (HTTP " + res.statusCode + ")"));
            }
            const fileStream = fs.createWriteStream(destPath);
            res.pipe(fileStream);
            fileStream.on("finish", () => {
                fileStream.close(() => resolve(destPath));
            });
            fileStream.on("error", reject);
        }).on("error", reject);
    });
}

async function downloadKwaiVideo(rawInput) {
    const { extractUrlAndFormat } = require("../urlExtractor");
    const { url: cleanUrl } = extractUrlAndFormat(rawInput);

    if (!cleanUrl) {
        throw new Error("Link do Kwai não encontrado no texto informado.");
    }

    const res = await fetch(cleanUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
        },
        redirect: "follow"
    });

    if (!res.ok) {
        throw new Error("Não foi possível acessar o link do Kwai (HTTP " + res.status + ").");
    }

    const html = await res.text();
    const finalUrl = res.url || cleanUrl;

    let videoUrl = null;

    // Busca TODOS os links .mp4 no HTML e ordena por qualidade (maior primeiro)
    const allMp4Matches = html.match(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/gi) || [];
    const cleanedUrls = allMp4Matches.map(u => u.replace(/\\u002F/g, '/').replace(/\\/g, ''));

    if (cleanedUrls.length > 0) {
        // Scora cada URL por resolução/qualidade aparente
        const scored = cleanedUrls.map(u => {
            let score = 0;
            const lower = u.toLowerCase();
            // URLs com /expmp4/ ou /originals/ são as de maior qualidade
            if (/expmp4|originals|\/video\/\d+p/.test(lower)) score += 1000;
            // Padrões de resolução na URL
            if (/2160p|2160|4k/i.test(lower)) score += 900;
            if (/1440p|1440|2k/i.test(lower)) score += 700;
            if (/1080p|1080/i.test(lower)) score += 500;
            if (/720p|720/i.test(lower)) score += 300;
            if (/540p|540/i.test(lower)) score += 100;
            if (/480p|480/i.test(lower)) score += 50;
            // URLs maiores tendem a ser de melhor qualidade
            if (lower.includes('v1')) score += 10;
            if (lower.includes('v2')) score += 20;
            // Penaliza previews e thumbnails
            if (/thumb|preview|poster|_s\./i.test(lower)) score -= 500;
            return { url: u, score };
        }).sort((a, b) => b.score - a.score);

        videoUrl = scored[0].url;
    }

    // Fallback: og:video (pode ser preview de baixa qualidade)
    if (!videoUrl) {
        const ogVideo = html.match(/<meta[^>]*property=["']og:video["'][^>]*content=["']([^"']+\.mp4[^"']*)["']/i)
            || html.match(/<meta[^>]*content=["']([^"']+\.mp4[^"']*)["'][^>]*property=["']og:video["']/i);
        if (ogVideo) videoUrl = ogVideo[1];
    }

    let thumbnail = null;
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogImage) {
        thumbnail = ogImage[1];
    }

    let title = "Vídeo do Kwai";
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
        title = titleMatch[1].replace(/ - Kwai$/i, '').trim();
    }

    let author = "Kwai Creator";
    const authorMatch = finalUrl.match(/kwai\.com\/@([a-zA-Z0-9_.-]+)/i);
    if (authorMatch) {
        author = "@" + authorMatch[1];
    }

    const videoTempDir = path.join(tempDir, "kwai");
    if (!fs.existsSync(videoTempDir)) {
        fs.mkdirSync(videoTempDir, { recursive: true });
    }

    // Verifica se é carrossel de fotos do Kwai
    const photoMatches = html.match(/https:\/\/ak-br-cdn\.kwai\.net\/upic\/[^\s"'<>]+\.(?:jpg|png|webp|jpeg)/gi) || [];
    const uniquePhotos = [...new Set(photoMatches)];
    if (uniquePhotos.length > 1 && !videoUrl) {
        return {
            images: uniquePhotos,
            title,
            author,
            durationFormatted: "—",
            thumbnail: uniquePhotos[0],
            url: finalUrl
        };
    }

    if (!videoUrl) {
        throw new Error("Não foi possível encontrar o vídeo MP4 no link do Kwai fornecido.");
    }

    const jobId = "kwai_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const outputPath = path.join(videoTempDir, jobId + ".mp4");

    await downloadFile(videoUrl, outputPath);

    const timestampMatch = html.match(/"timestamp":\s*(\d+)/i) || html.match(/"uploadTime":\s*"([^"]+)"/i) || html.match(/"createTime":\s*(\d+)/i);
    let uploadDate = timestampMatch ? timestampMatch[1] : null;
    let year = uploadDate ? (String(uploadDate).length >= 10 ? String(new Date(Number(uploadDate) * 1000).getFullYear()) : (new Date(uploadDate).getFullYear() ? String(new Date(uploadDate).getFullYear()) : null)) : null;

    return {
        filePath: outputPath,
        title,
        author,
        durationFormatted: "—",
        thumbnail,
        url: finalUrl,
        uploadDate,
        year
    };
}

class KwaiProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.KWAI);
    }

    match(url) {
        if (!url || typeof url !== "string") return false;
        // Compara o HOST, não o texto: antes bastava a URL CONTER "kwai.com/"
        // em qualquer lugar (inclusive no caminho ou na query de outro site).
        const { ehHostDe } = require("../urlSeguro");
        return ehHostDe(url, ["kwai.com", "kwai-video.com"]);
    }

    normalizeUrl(url) {
        return url.trim();
    }
}

KwaiProvider.downloadKwaiVideo = downloadKwaiVideo;

module.exports = KwaiProvider;
module.exports.downloadKwaiVideo = downloadKwaiVideo;
