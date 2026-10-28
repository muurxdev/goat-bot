/**
 * TikTok Media Provider & Resilient Downloader
 * Download direto de vídeos do TikTok em alta resolução sem marca d'água e suporte a Carrossel de Fotos
 */

const fs = require("fs");
const path = require("path");
const BaseProvider = require("./baseProvider");
const { PLATFORMS } = require("../constants");
const { tempDir } = require("../../../config/paths");
const { buscarComSeguranca } = require("../urlSeguro");
const logger = require("../../../core/logger");

/**
 * Resolve redirecionamentos de URLs encurtadas (vt.tiktok.com, vm.tiktok.com, /t/)
 */
async function expandShortUrl(url) {
    try {
        if (!url.includes('vt.tiktok.com') && !url.includes('vm.tiktok.com') && !url.includes('tt.site/') && !url.includes('/t/')) {
            return url;
        }
        // buscarComSeguranca confere cada salto (sem `redirect: 'follow'` com URL de usuário)
        const { destino } = await buscarComSeguranca(url, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(8000)
        });
        return destino || url;
    } catch (_) {
        return url;
    }
}

/**
 * Consulta JSON com timeout estrito via native fetch
 */
async function fetchJSON(url, timeoutMs = 12000) {
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*"
        },
        signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

const { pipeline } = require("stream/promises");
const { Readable } = require("stream");

/**
 * Download de arquivo com streaming direto para disco e timeout de inatividade
 */
async function downloadFile(url, destPath, maxWaitMs = 180000) {
    const controller = new AbortController();
    let timeoutId = setTimeout(() => controller.abort(), maxWaitMs);

    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Referer": "https://www.tiktok.com/"
        },
        signal: controller.signal
    });
    if (!res.ok) {
        clearTimeout(timeoutId);
        throw new Error(`Falha HTTP ${res.status}`);
    }
    if (!res.body) {
        clearTimeout(timeoutId);
        throw new Error("Resposta HTTP sem corpo de stream");
    }

    const fileStream = fs.createWriteStream(destPath);
    const nodeStream = Readable.fromWeb(res.body);

    // Timeout de inatividade: se a transferência congelar por 45s sem nenhum byte novo, aborta
    nodeStream.on("data", () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => controller.abort(), 45000);
    });

    try {
        await pipeline(nodeStream, fileStream);
        clearTimeout(timeoutId);
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
            return destPath;
        }
        throw new Error("Arquivo baixado está vazio");
    } catch (err) {
        clearTimeout(timeoutId);
        try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (errIgnorado) { logger.warn(`[TIKTOK] Falha ignorada ao limpar ${destPath}: ${errIgnorado.message}`); }
        throw err;
    }
}

function downloadTikTokWithYtDlp(url, outputPath) {
    return new Promise((resolve, reject) => {
        const { spawn } = require("child_process");
        let getYtDlpEnv;
        try { getYtDlpEnv = require("../mediaArgs").getYtDlpEnv; } catch (_) { getYtDlpEnv = () => process.env; }

        const proc = spawn("yt-dlp", [
            "--no-playlist",
            "--no-warnings",
            // stdout não é lido: sem isto o andamento enche o pipe e o yt-dlp trava no meio.
            "--quiet", "--no-progress",
            "--impersonate", "chrome",
            "-f", "bv*+ba/b",
            "-S", "res,fps,vcodec:h264",
            "--merge-output-format", "mp4",
            "-o", outputPath,
            url
        ], { env: getYtDlpEnv(), stdio: ["ignore", "ignore", "pipe"] });

        let err = "";
        proc.stderr.on("data", d => { err += d; });
        const timer = setTimeout(() => {
            try { proc.kill("SIGKILL"); } catch (errIgnorado) { logger.warn(`[TIKTOK] Falha ignorada em src/services/media/providers/tiktok.js:86: ${errIgnorado.message}`) }
            reject(new Error("Timeout no yt-dlp (300s)"));
        }, 300000);

        proc.on("close", code => {
            clearTimeout(timer);
            if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                resolve(outputPath);
            } else {
                reject(new Error(`yt-dlp erro (${code}): ${err.slice(0, 150)}`));
            }
        });
        proc.on("error", reject);
    });
}

/**
 * Consulta à TikWM compartilhada por 2 minutos. O aviso de download (que mostra
 * a capa antes do vídeo) e o próprio download pedem os mesmos dados quase ao
 * mesmo tempo; com a promessa em comum, a API é chamada uma vez só — a TikWM
 * gratuita limita pedidos por segundo. Falha não fica guardada.
 */
const consultasTikwm = new Map()
function consultarTikwm(cleanUrl) {
    const guardada = consultasTikwm.get(cleanUrl)
    if (guardada && Date.now() - guardada.em < 2 * 60 * 1000) return guardada.promessa
    const promessa = fetchJSON("https://www.tikwm.com/api/?url=" + encodeURIComponent(cleanUrl) + "&hd=1", 10000)
        .then(res => {
            if (!res || res.code !== 0 || !res.data) consultasTikwm.delete(cleanUrl)
            return res
        })
        .catch(err => {
            consultasTikwm.delete(cleanUrl)
            throw err
        })
    consultasTikwm.set(cleanUrl, { promessa, em: Date.now() })
    if (consultasTikwm.size > 200) consultasTikwm.delete(consultasTikwm.keys().next().value)
    return promessa
}

/**
 * Capa, título, autor e duração de um TikTok, sem baixar o vídeo.
 * @returns {Promise<{thumbnail?:string, title?:string, author?:string, durationFormatted?:string}|null>}
 */
async function infoTikTok(tiktokUrl) {
    const cleanUrl = await expandShortUrl(String(tiktokUrl || '').trim());
    const res = await consultarTikwm(cleanUrl);
    if (!res || res.code !== 0 || !res.data) return null;
    const data = res.data;
    const capa = data.origin_cover || data.cover || null;
    return {
        thumbnail: capa && capa.startsWith("/") ? "https://www.tikwm.com" + capa : capa,
        title: data.title || null,
        author: data.author?.nickname || data.author?.unique_id || null,
        durationFormatted: data.duration ? (Math.floor(data.duration / 60) + ":" + String(data.duration % 60).padStart(2, "0")) : null
    };
}

async function downloadTikTokVideo(tiktokUrl) {
    const startedAt = Date.now();
    const initialUrl = tiktokUrl.trim();
    const cleanUrl = await expandShortUrl(initialUrl);

    const videoTempDir = path.join(tempDir, "tiktok");
    if (!fs.existsSync(videoTempDir)) {
        fs.mkdirSync(videoTempDir, { recursive: true });
    }

    const jobId = "tiktok_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const outputPath = path.join(videoTempDir, jobId + ".mp4");

    // 1. TENTATIVA COM TIKWM API
    let res = null;
    try {
        res = await consultarTikwm(cleanUrl);
    } catch (e) {
        logger.warn("[TIKTOK] TikWM API indisponível: " + e.message);
    }

    let tikwmData = null;
    // SE TIKWM RESPONDEU COM SUCESSO
    if (res && res.code === 0 && res.data) {
        tikwmData = res.data;
        const data = res.data;
        const uploadDate = data.create_time ? new Date(data.create_time * 1000).toISOString() : null;
        const year = data.create_time ? String(new Date(data.create_time * 1000).getFullYear()) : null;

        // VERIFICAÇÃO DE CARROSSEL DE FOTOS / SLIDESHOW
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            const carouselItems = [];
            logger.info("[TIKTOK] Carrossel detectado com " + data.images.length + " imagens");

            for (let i = 0; i < data.images.length; i++) {
                let imgUrl = data.images[i];
                if (imgUrl.startsWith("/")) imgUrl = "https://www.tikwm.com" + imgUrl;
                const imgPath = path.join(videoTempDir, jobId + "_slide_" + (i + 1) + ".jpg");
                try {
                    await downloadFile(imgUrl, imgPath, 30000);
                    carouselItems.push({ path: imgPath, type: "image", index: i + 1 });
                } catch (imgErr) {
                    logger.warn("[TIKTOK CAROUSEL WARN] Falha ao baixar slide " + (i + 1) + ": " + imgErr.message);
                }
            }

            return {
                isCarousel: true,
                carouselCount: carouselItems.length,
                carouselItems,
                title: data.title || "Carrossel do TikTok",
                author: data.author?.nickname || data.author?.unique_id || "TikTok User",
                durationFormatted: "—",
                thumbnail: data.origin_cover || data.cover,
                url: cleanUrl,
                uploadDate,
                year,
                musicTitle: data.music_info?.title || "",
                elapsedMs: Date.now() - startedAt
            };
        }

        // VÍDEO DO TIKTOK: Tenta HD primeiro (hdplay), depois play normal e wmplay
        const candidateStreams = [data.hdplay, data.play, data.wmplay].filter(Boolean);
        for (let streamUrl of candidateStreams) {
            if (streamUrl.startsWith("/")) {
                streamUrl = "https://www.tikwm.com" + streamUrl;
            }

            try {
                await downloadFile(streamUrl, outputPath, 180000);
                return {
                    isCarousel: false,
                    filePath: outputPath,
                    title: data.title || "Vídeo do TikTok",
                    author: data.author?.nickname || data.author?.unique_id || "TikTok User",
                    durationFormatted: data.duration ? (Math.floor(data.duration / 60) + ":" + String(data.duration % 60).padStart(2, "0")) : "—",
                    thumbnail: data.origin_cover || data.cover,
                    url: cleanUrl,
                    uploadDate,
                    year,
                    musicTitle: data.music_info?.title || "",
                    elapsedMs: Date.now() - startedAt
                };
            } catch (dlErr) {
                logger.warn("[TIKTOK] Falha no download do stream TikWM (" + streamUrl.slice(0, 45) + "...): " + dlErr.message);
            }
        }
    }

    // 2. TENTATIVA COM TIKLYDOWN API
    try {
        const tiklyUrl = "https://api.tiklydown.eu.org/api/download?url=" + encodeURIComponent(cleanUrl);
        const tRes = await fetchJSON(tiklyUrl, 8000);
        if (tRes && (tRes.video || tRes.url)) {
            const stream = tRes.video?.noWatermark || tRes.video?.watermark || tRes.url;
            if (stream) {
                await downloadFile(stream, outputPath, 180000);
                return {
                    isCarousel: false,
                    filePath: outputPath,
                    title: tRes.title || tikwmData?.title || "Vídeo do TikTok",
                    author: tRes.author?.name || tikwmData?.author?.nickname || "TikTok Creator",
                    durationFormatted: "—",
                    thumbnail: null,
                    url: cleanUrl,
                    uploadDate: tRes.created_at || null,
                    year: tRes.created_at ? String(new Date(tRes.created_at).getFullYear()) : null,
                    musicTitle: tRes.music?.title || "",
                    elapsedMs: Date.now() - startedAt
                };
            }
        }
    } catch (errIgnorado) { logger.warn(`[TIKTOK] Falha ignorada em src/services/media/providers/tiktok.js:278: ${errIgnorado.message}`) }

    // 3. FALLBACK VIA YT-DLP COM IMPERSONATE CHROME
    logger.info("[TIKTOK] Baixando via yt-dlp na resolução máxima...");
    await downloadTikTokWithYtDlp(cleanUrl, outputPath);

    const fallbackTitle = tikwmData?.title || "Vídeo do TikTok";
    const fallbackAuthor = tikwmData?.author?.nickname || tikwmData?.author?.unique_id || "TikTok Creator";
    const fallbackDuration = tikwmData?.duration ? (Math.floor(tikwmData.duration / 60) + ":" + String(tikwmData.duration % 60).padStart(2, "0")) : "—";
    const fallbackCover = tikwmData?.origin_cover || tikwmData?.cover || null;
    const fallbackDate = tikwmData?.create_time ? new Date(tikwmData.create_time * 1000).toISOString() : null;
    const fallbackYear = tikwmData?.create_time ? String(new Date(tikwmData.create_time * 1000).getFullYear()) : null;

    return {
        isCarousel: false,
        filePath: outputPath,
        title: fallbackTitle,
        author: fallbackAuthor,
        durationFormatted: fallbackDuration,
        thumbnail: fallbackCover,
        url: cleanUrl,
        uploadDate: fallbackDate,
        year: fallbackYear,
        musicTitle: tikwmData?.music_info?.title || "",
        elapsedMs: Date.now() - startedAt
    };
}

class TikTokProvider extends BaseProvider {
    constructor() {
        super(PLATFORMS.TIKTOK);
    }

    match(url) {
        if (!url || typeof url !== "string") return false;
        // Host primeiro: o teste por texto abaixo aceitava "dropbox.com/" como "x.com/".
        if (!require('../plataformas').ehPlataforma(url, 'tiktok')) return false;
        const lower = url.toLowerCase();
        return (
            lower.includes("tiktok.com/@") ||
            lower.includes("vm.tiktok.com/") ||
            lower.includes("vt.tiktok.com/") ||
            lower.includes("tiktok.com/t/") ||
            // tt.site é o encurtador de compartilhamento do próprio TikTok (tt.site/t/<código>):
            // o link do app chega assim e antes o bot dizia "faltou o link do TikTok".
            /^https?:\/\/(www\.)?tt\.site\/[^\s]+/.test(lower) ||
            // links longos que o app também gera: /v/<id> (mobile) e /video|photo/<id> sem o @usuário
            /tiktok\.com\/(v|video|photo)\/\d+/.test(lower)
        );
    }

    normalizeUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.origin + parsed.pathname;
        } catch (_) {
            return url;
        }
    }
}

TikTokProvider.downloadTikTokVideo = downloadTikTokVideo;

module.exports = TikTokProvider;
module.exports.downloadTikTokVideo = downloadTikTokVideo;
module.exports.infoTikTok = infoTikTok;
