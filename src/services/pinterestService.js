/**
 * Pinterest Service
 * Download resiliente de Imagens em Alta Resolução (Originals), Vídeos MP4 e Carrosséis do Pinterest
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { tempDir } = require("../config/paths");
const logger = require("../core/logger");
const { extractUrlAndFormat } = require("./media/urlExtractor");

// Teto de 2 GB por arquivo: o mesmo limite que o resto do projeto usa.
const MAX_BYTES_ARQUIVO = 2000 * 1024 * 1024;

function downloadFile(fileUrl, destPath, saltos = 0) {
    return new Promise((resolve, reject) => {
        const { urlSegura, MAX_REDIRECIONAMENTOS } = require("./media/urlSeguro");
        if (!urlSegura(fileUrl)) {
            return reject(new Error("Endereço de download recusado por segurança."));
        }
        // Sem teto de saltos, um servidor que responde 302 para ele mesmo prendia
        // o bot num laço de requisições que nunca terminava.
        if (saltos > MAX_REDIRECIONAMENTOS) {
            return reject(new Error("O link ficou pulando de endereço em endereço e eu desisti."));
        }
        const u = new URL(fileUrl);
        const client = u.protocol === "https:" ? https : http;
        const fileStream = fs.createWriteStream(destPath);
        let baixados = 0;

        const req = client.get(fileUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
        }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fileStream.close();
                if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                return resolve(downloadFile(new URL(res.headers.location, fileUrl).href, destPath, saltos + 1));
            }
            if (res.statusCode !== 200) {
                fileStream.close();
                if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
                return reject(new Error("Falha HTTP ao baixar arquivo: " + res.statusCode));
            }
            res.on("data", chunk => {
                baixados += chunk.length;
                if (baixados > MAX_BYTES_ARQUIVO) {
                    req.destroy();
                    fileStream.close();
                    try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (rmErr) { logger.warn("[PINTEREST] Sobrou o temporário " + destPath + ": " + rmErr.message); }
                    reject(new Error("Esse arquivo passou do tamanho que eu aguento baixar."));
                }
            });
            res.pipe(fileStream);
            fileStream.on("finish", () => {
                fileStream.close();
                resolve(destPath);
            });
        });
        req.on("error", err => {
            fileStream.close();
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
            reject(err);
        });
    });
}

function convertVideoToMp3(videoPath, mp3Path) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
            "-y",
            "-threads", "0",
            "-i", videoPath,
            "-vn",
            "-c:a", "libmp3lame",
            // Só `-b:a`: "-b:a 320k" com "-q:a 0" são duas ordens contrárias
            // (CBR e VBR) e o lame ficava com a última, caindo para ~245 kbps.
            // `-ar` saiu junto: a taxa de amostragem da fonte é preservada.
            "-b:a", "320k",
            mp3Path
        ]);

        ffmpeg.on("close", code => {
            if (code === 0 && fs.existsSync(mp3Path) && fs.statSync(mp3Path).size > 0) {
                resolve(mp3Path);
            } else {
                reject(new Error("Falha ao extrair áudio MP3 do vídeo."));
            }
        });
        ffmpeg.on("error", reject);
    });
}

async function downloadPinterestMedia(urlOrQuery, { format = "mp4" } = {}) {
    const { url: extractedUrl } = extractUrlAndFormat(urlOrQuery);
    const target = extractedUrl || urlOrQuery.trim();
    // Compara o HOST, não o texto. Antes qualquer endereço que CONTIVESSE
    // "pinterest.com" passava — inclusive `https://servidor-do-atacante.tld/?x=pinterest.com`,
    // e quem fazia a requisição era a VPS.
    const { linkPermitido } = require("./media/urlSeguro");
    const isUrl = linkPermitido(target, ["pinterest.com", "pin.it", "pinterest.co.uk", "br.pinterest.com"]);
    const pinTempDir = path.join(tempDir, "pinterest");
    if (!fs.existsSync(pinTempDir)) fs.mkdirSync(pinTempDir, { recursive: true });

    const jobId = "pin_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

    if (isUrl) {
        logger.info("[PINTEREST] Processando link: " + target);

        const res = await fetch(target, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
            },
            redirect: "follow"
        });

        const html = await res.text();
        const finalUrl = res.url || target;

        // Extrai título e autor
        let title = "Pinterest Media";
        const titleMatch = html.match(/<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
            title = titleMatch[1].replace(/\s*\|\s*Pinterest$/i, "").trim();
        }

        let author = "";
        const authorMatch = html.match(/<meta[^>]+(?:name|property)=["'](?:author|og:site_name|twitter:creator|article:author)["'][^>]+content=["']([^"']+)["']/i);
        if (authorMatch && authorMatch[1] && !authorMatch[1].toLowerCase().includes("pinterest")) {
            author = authorMatch[1].trim();
        }

        // Se o título tiver separadores (Ex: "Nome da Arte | Criador ou Coleção"), divide entre título e autor
        if (title.includes("|")) {
            const parts = title.split("|").map(s => s.trim());
            if (parts.length > 1 && parts[1]) {
                title = parts[0];
                if (!author || author === "Pinterest") {
                    author = parts[1].split(",")[0].trim();
                }
            }
        } else if (title.includes(" - ")) {
            const parts = title.split(" - ").map(s => s.trim());
            if (parts.length > 1 && parts[1]) {
                title = parts[0];
                if (!author || author === "Pinterest") {
                    author = parts[1].trim();
                }
            }
        }

        // Se ainda for vazio ou "Pinterest", extrai o usuário da URL ou identificador
        if (!author || author.toLowerCase() === "pinterest") {
            const urlUserMatch = finalUrl.match(/pinterest\.[a-z.]+\/([a-zA-Z0-9_-]+)\//i);
            if (urlUserMatch && !["pin", "resource", "search", "ideas"].includes(urlUserMatch[1].toLowerCase())) {
                author = "@" + urlUserMatch[1];
            } else {
                author = "Pinterest Creator";
            }
        }

        let uploadDate = null;
        let year = null;
        const dateMatch = html.match(/<meta[^>]+(?:property|name)=["'](?:article:published_time|og:updated_time)["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/"(?:uploadDate|datePublished|createdAt)":\s*"([^"]+)"/i);
        if (dateMatch && dateMatch[1]) {
            uploadDate = dateMatch[1];
            const parsedY = new Date(dateMatch[1]).getUTCFullYear();
            if (parsedY && !isNaN(parsedY)) year = String(parsedY);
        }

        // 0. Chromium (headless) — LIVE WALLPAPERS/vídeo em alta qualidade. O HTML
        //    puro costuma não trazer o mp4 (o Pinterest carrega o vídeo por JS).
        //    Tolerante: se não houver Chromium, cai no método fetch abaixo.
        let browserVideoUrl = null;
        try {
            const { resolvePinterestMedia } = require("./media/providers/pinterestBrowser");
            const { getCookiesPathFor } = require("./media/mediaArgs");
            const resolved = await resolvePinterestMedia(finalUrl, { cookiesPath: getCookiesPathFor(null) });
            if (resolved) {
                if (resolved.title && (!title || title === "Pinterest Media")) title = resolved.title;
                if (resolved.videoUrl) browserVideoUrl = resolved.videoUrl;
            }
        } catch (e) {
            if (e.code !== "BROWSER_UNAVAILABLE") {
                logger.warn(`[PINTEREST] Chromium falhou (${e.message}); usando método fetch.`);
            }
        }

        // 1. Procura vídeo MP4 (Chromium tem prioridade; senão, regex no HTML selecionando a maior resolução)
        let videoUrl = browserVideoUrl;
        if (!videoUrl) {
            const allMp4 = (html.match(/https?:\/\/[^\s"'<>\\]+\.mp4[^\s"'<>\\]*/gi) || [])
                .map(u => u.replace(/\\u002F/g, '/').replace(/\\/g, ''));
            if (allMp4.length > 0) {
                const scorePinRes = (u) => {
                    const s = u.toLowerCase();
                    if (/1080p|1080/.test(s)) return 1000;
                    if (/720p|720/.test(s)) return 800;
                    if (/540p|540/.test(s)) return 500;
                    if (/480p|480/.test(s)) return 300;
                    if (/v\.pinimg\.com\/videos\//.test(s)) return 200;
                    return 50;
                };
                allMp4.sort((a, b) => scorePinRes(b) - scorePinRes(a));
                videoUrl = allMp4[0];
            }
        }

        if (videoUrl) {
            const rawVideoPath = path.join(pinTempDir, jobId + "_raw.mp4");
            await downloadFile(videoUrl, rawVideoPath);

            if (format === "mp3" || format === "audio") {
                const mp3Path = path.join(pinTempDir, jobId + ".mp3");
                await convertVideoToMp3(rawVideoPath, mp3Path);
                try { fs.unlinkSync(rawVideoPath); } catch (errIgnorado) { logger.warn(`[PINTERESTSERVICE] Falha ignorada em src/services/pinterestService.js:223: ${errIgnorado.message}`) }
                return {
                    filePath: mp3Path,
                    title,
                    author,
                    durationFormatted: "—",
                    thumbnail: null,
                    url: finalUrl,
                    uploadDate,
                    year,
                    isVideo: false,
                    isAudio: true,
                    mimetype: "audio/mpeg",
                    platform: "Pinterest"
                };
            }

            return {
                filePath: rawVideoPath,
                title,
                author,
                durationFormatted: "—",
                thumbnail: null,
                url: finalUrl,
                uploadDate,
                year,
                isVideo: true,
                isAudio: false,
                mimetype: "video/mp4",
                platform: "Pinterest"
            };
        }

        // 2. Procura imagem original HD (originals) ou 736x
        let imgUrl = null;
        const ogImage = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image:src)["'][^>]+content=["']([^"']+)["']/i);
        if (ogImage) {
            imgUrl = ogImage[1];
        } else {
            const pinImg = html.match(/https:\/\/i\.pinimg\.com\/[^\s"'<>]+\.(?:jpg|png|webp)/i);
            if (pinImg) imgUrl = pinImg[0];
        }

        if (imgUrl) {
            imgUrl = imgUrl.replace(/\/\d+x\//, "/originals/");
            const ext = imgUrl.endsWith(".png") ? "png" : "jpg";
            const imgPath = path.join(pinTempDir, jobId + "." + ext);
            
            try {
                await downloadFile(imgUrl, imgPath);
            } catch (_) {
                // Fallback para 736x se originals falhar
                if (imgUrl.includes("/originals/")) {
                    imgUrl = imgUrl.replace("/originals/", "/736x/");
                    await downloadFile(imgUrl, imgPath);
                }
            }

            return {
                filePath: imgPath,
                title,
                author,
                durationFormatted: "—",
                thumbnail: imgUrl,
                url: finalUrl,
                uploadDate,
                year,
                isVideo: false,
                isAudio: false,
                mimetype: ext === "png" ? "image/png" : "image/jpeg",
                platform: "Pinterest"
            };
        }

        throw new Error("Não foi possível encontrar imagem ou vídeo no Pin do Pinterest.");
    }

    // Pesquisa de Imagem no Pinterest
    const searchQuery = target;
    const searchUrl = "https://www.pinterest.com/resource/BaseSearchResource/get/?data=" + encodeURIComponent(JSON.stringify({
        options: { query: searchQuery, scope: "pins" },
        context: {}
    }));

    try {
        const sRes = await fetch(searchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
        });
        const parsed = await sRes.json();
        const results = parsed?.resource_response?.data?.results || [];

        if (results.length > 0) {
            const pin = results.find(p => p.images?.orig?.url || p.images?.["736x"]?.url) || results[0];
            const imgUrl = pin.images?.orig?.url || pin.images?.["736x"]?.url || pin.image_large_url;
            const title = pin.grid_title || pin.title || searchQuery;
            const pinUrl = pin.id ? "https://www.pinterest.com/pin/" + pin.id + "/" : "https://www.pinterest.com";

            if (imgUrl) {
                const imgPath = path.join(pinTempDir, jobId + ".jpg");
                await downloadFile(imgUrl, imgPath);
                return {
                    filePath: imgPath,
                    title,
                    author: pin.pinner?.username || "Pinterest",
                    durationFormatted: "—",
                    thumbnail: imgUrl,
                    url: pinUrl,
                    isVideo: false,
                    isAudio: false,
                    mimetype: "image/jpeg",
                    platform: "Pinterest"
                };
            }
        }
    } catch (searchErr) {
        logger.warn("[PINTEREST SEARCH WARN] " + searchErr.message);
    }

    // Fallback 2: Raspagem da página de busca do Pinterest se a API falhar
    try {
        const htmlRes = await fetch("https://www.pinterest.com/search/pins/?q=" + encodeURIComponent(searchQuery), {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
            }
        });
        const htmlText = await htmlRes.text();
        const imgMatches = htmlText.match(/https:\/\/i\.pinimg\.com\/(?:originals|736x)\/[a-zA-Z0-9_\/-]+\.(?:jpg|png|webp)/gi);
        if (imgMatches && imgMatches.length > 0) {
            let imgUrl = imgMatches[0];
            if (imgUrl.includes('/736x/')) {
                // Tenta promover para originals
                const origCandidate = imgUrl.replace('/736x/', '/originals/');
                imgUrl = origCandidate;
            }
            const imgPath = path.join(pinTempDir, jobId + ".jpg");
            try {
                await downloadFile(imgUrl, imgPath);
            } catch (_) {
                if (imgUrl.includes('/originals/')) {
                    imgUrl = imgUrl.replace('/originals/', '/736x/');
                    await downloadFile(imgUrl, imgPath);
                }
            }

            return {
                filePath: imgPath,
                title: searchQuery,
                author: "Pinterest Creator",
                durationFormatted: "—",
                thumbnail: imgUrl,
                url: "https://www.pinterest.com/search/pins/?q=" + encodeURIComponent(searchQuery),
                isVideo: false,
                isAudio: false,
                mimetype: "image/jpeg",
                platform: "Pinterest"
            };
        }
    } catch (scrapingErr) {
        logger.warn("[PINTEREST SCRAPE WARN] " + scrapingErr.message);
    }

    throw new Error(`Nenhum resultado real foi encontrado no Pinterest para "${searchQuery}". Tente usar palavras-chave mais específicas.`);
}

module.exports = {
    downloadPinterestMedia
};
