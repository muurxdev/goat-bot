/**
 * YouTube Anti-Bot Resilient Fallback Engine v3
 * Estratégia: RACE paralelo entre múltiplas APIs — pega a primeira que responder
 * Sem esperar falhar uma por uma → muito mais rápido
 */

const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");
const logger = require("../../core/logger");

function extractYouTubeVideoId(input) {
    if (!input || typeof input !== "string") return null;
    const match = input.match(/(?:v=|\/|youtu\.be\/|watch\?v=|shorts\/|live\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
}

/**
 * Resolve metadados via YouTube oEmbed (rápido, sem yt-dlp, sem anti-bot)
 */
async function resolveYouTubeOEmbed(url) {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;

    const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const { getBestYouTubeThumbnail } = require('./thumbnailResolver');
    const officialThumb = await getBestYouTubeThumbnail(videoId);

    try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(standardUrl)}&format=json`;
        const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            const data = await res.json();
            let duration = 0;
            let durationFormatted = '—';
            let uploadDate = null;
            let views = 0;
            try {
                const pageRes = await fetch(standardUrl, {
                    // A página passa de 1,3 MB e leva ~2 s na VPS (1 vCPU): com os
                    // 3,5 s de antes ela era abortada na metade das vezes e a
                    // legenda saía sem data de publicação.
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
                    signal: AbortSignal.timeout(9000)
                });
                if (pageRes.ok) {
                    const html = await pageRes.text();
                    const m = html.match(/"lengthSeconds":"(\d+)"/);
                    if (m && m[1]) {
                        duration = parseInt(m[1], 10);
                        const { formatDuration } = require('./formatResolver');
                        durationFormatted = formatDuration(duration);
                    }
                    // A mesma página já traz quando o vídeo foi postado — o
                    // yt-dlp só entrega isso com cookies válidos, e sem eles a
                    // legenda ficava sem data. Vem escrito "23 de abr. de 2005".
                    const d = html.match(/"(?:publishDate|dateText)":\{"simpleText":"([^"]+)"/);
                    if (d && d[1]) uploadDate = d[1];
                    const v = html.match(/"viewCount":"(\d+)"/);
                    if (v && v[1]) views = parseInt(v[1], 10);
                }
            } catch (pageErr) {
                logger.warn(`[YOUTUBE OEMBED] Página de ${videoId} não abriu, sigo sem duração e data: ${pageErr.message}`);
            }

            return {
                id: videoId,
                title: data.title || "Vídeo do YouTube",
                author: data.author_name || "YouTube",
                duration,
                durationFormatted,
                uploadDate,
                views,
                thumbnail: officialThumb,
                url: standardUrl
            };
        }
    } catch (err) {
        logger.warn(`[YOUTUBE OEMBED WARN] ${err.message}`);
    }

    return { id: videoId, title: "Vídeo do YouTube", author: "YouTube", thumbnail: officialThumb, url: standardUrl, duration: 0, durationFormatted: "—" };
}

// Teto de 2 GB, o mesmo do resto do projeto (media/constants.js).
const MAX_BYTES_STREAM = 2000 * 1024 * 1024;

function streamToFile(fileUrl, destPath, saltos = 0) {
    return new Promise((resolve, reject) => {
        const { urlSegura, MAX_REDIRECIONAMENTOS } = require("./urlSeguro");
        if (!urlSegura(fileUrl)) {
            return reject(new Error("Endereço de download recusado por segurança."));
        }
        if (saltos > MAX_REDIRECIONAMENTOS) {
            return reject(new Error("O link ficou pulando de endereço em endereço e eu desisti."));
        }
        const u = new URL(fileUrl);
        const client = u.protocol === "https:" ? https : http;
        const fileStream = fs.createWriteStream(destPath);

        const req = client.get(fileUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept": "*/*",
                "Accept-Encoding": "identity"
            }
        }, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                fileStream.close();
                try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (errIgnorado) { logger.warn(`[YOUTUBEFALLBACK] Falha ignorada em src/services/media/youtubeFallback.js:111: ${errIgnorado.message}`) }
                return resolve(streamToFile(new URL(res.headers.location, fileUrl).href, destPath, saltos + 1));
            }
            if (res.statusCode !== 200) {
                fileStream.close();
                try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (errIgnorado) { logger.warn(`[YOUTUBEFALLBACK] Falha ignorada em src/services/media/youtubeFallback.js:116: ${errIgnorado.message}`) }
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            // O contador existia e não era comparado com nada: o arquivo podia
            // crescer até encher o disco da VPS.
            let totalBytes = 0;
            res.on("data", chunk => {
                totalBytes += chunk.length;
                if (totalBytes > MAX_BYTES_STREAM) {
                    req.destroy();
                    fileStream.close();
                    try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (rmErr) { logger.warn(`[YOUTUBE RESILIENT] Sobrou o temporário ${destPath}: ${rmErr.message}`); }
                    reject(new Error("Esse arquivo passou do tamanho que eu aguento baixar."));
                }
            });
            res.pipe(fileStream);
            fileStream.on("finish", () => { fileStream.close(); resolve(destPath); });
            fileStream.on("error", err => { fileStream.close(); try { fs.unlinkSync(destPath); } catch (errIgnorado) { logger.warn(`[YOUTUBEFALLBACK] Falha ignorada em src/services/media/youtubeFallback.js:133: ${errIgnorado.message}`) } reject(err); });
        });

        req.on("error", err => {
            fileStream.close();
            try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch (errIgnorado) { logger.warn(`[YOUTUBEFALLBACK] Falha ignorada em src/services/media/youtubeFallback.js:138: ${errIgnorado.message}`) }
            reject(err);
        });

        req.setTimeout(90000, () => { req.destroy(); reject(new Error("Stream timeout")); });
    });
}

const INVIDIOUS_POOL = [
    'https://yt.chocolatemoo53.com',
    'https://invidious.nerdvpn.de',
    'https://inv.nadeko.net',
    'https://invidious.tiekoetter.com'
];

let cachedInvidiousInstances = [...INVIDIOUS_POOL];
let lastInvidiousFetch = 0;

async function getInvidiousInstances() {
    const agora = Date.now();
    if (agora - lastInvidiousFetch < 3600000 && cachedInvidiousInstances.length > 0) {
        return cachedInvidiousInstances;
    }
    try {
        const r = await fetch('https://api.invidious.io/instances.json?sort_by=health', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(6000)
        });
        if (r.ok) {
            const list = await r.json();
            const healthy = list
                .filter(x => x[1] && x[1].type === 'https' && x[1].api)
                .map(x => x[1].uri.replace(/\/+$/, ''));
            if (healthy.length > 0) {
                cachedInvidiousInstances = [...new Set([...INVIDIOUS_POOL, ...healthy])];
                lastInvidiousFetch = agora;
            }
        }
    } catch (err) { logger.warn('[YOUTUBEFALLBACK] falha ignorada: ' + (err && err.message)) }
    return cachedInvidiousInstances;
}

/**
 * Baixa e converte diretamente via instâncias saudáveis de Invidious
 */
async function downloadViaInvidious(videoId, destPath, format = 'mp4') {
    const instances = await getInvidiousInstances();
    const { spawn } = require('child_process');

    for (const inst of instances) {
        try {
            const res = await fetch(`${inst}/api/v1/videos/${videoId}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(8000)
            });
            if (!res.ok) continue;
            const data = await res.json();
            const af = data.adaptiveFormats || [];
            if (!af.length) continue;

            if (format === 'mp3') {
                const audios = af.filter(x => (x.type || '').includes('audio'))
                    .sort((a, b) => (Number(b.bitrate) || 0) - (Number(a.bitrate) || 0));
                if (!audios.length) continue;

                const best = audios[0];
                const u = new URL(best.url, inst);
                const proxiedUrl = `${inst}${u.pathname}${u.search}`;

                await new Promise((resolve, reject) => {
                    const ffmpeg = spawn('ffmpeg', [
                        '-y', '-v', 'error',
                        '-headers', 'User-Agent: Mozilla/5.0\r\n',
                        '-i', proxiedUrl,
                        '-vn', '-c:a', 'libmp3lame', '-b:a', '320k',
                        destPath
                    ]);
                    const t = setTimeout(() => { try { ffmpeg.kill('SIGKILL'); } catch (err) { logger.warn('[YOUTUBEFALLBACK] falha ignorada: ' + (err && err.message)) } reject(new Error('timeout')); }, 120000);
                    ffmpeg.on('close', code => { clearTimeout(t); code === 0 ? resolve() : reject(new Error('code ' + code)); });
                    ffmpeg.on('error', err => { clearTimeout(t); reject(err); });
                });

                if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
                    logger.info(`[YOUTUBE RESILIENT] Invidious (${inst}) entregou áudio MP3 de ${require('../../utils/tamanho').formatarTamanho(fs.statSync(destPath).size)}`);
                    return true;
                }
            } else {
                const maxH = require('./constants').MEDIA_LIMITS.MAX_VIDEO_HEIGHT || 1080;
                const videos = af.filter(x => {
                    if (!(x.type || '').includes('video')) return false;
                    const resMatch = (x.resolution || '').match(/(\d+)p?/);
                    const h = resMatch ? parseInt(resMatch[1], 10) : 0;
                    return h <= maxH;
                }).sort((a, b) => (Number(b.bitrate) || 0) - (Number(a.bitrate) || 0));

                const audios = af.filter(x => (x.type || '').includes('audio'))
                    .sort((a, b) => (Number(b.bitrate) || 0) - (Number(a.bitrate) || 0));

                if (!videos.length || !audios.length) continue;

                const vU = new URL(videos[0].url, inst);
                const aU = new URL(audios[0].url, inst);
                const vUrl = `${inst}${vU.pathname}${vU.search}`;
                const aUrl = `${inst}${aU.pathname}${aU.search}`;

                await new Promise((resolve, reject) => {
                    const ffmpeg = spawn('ffmpeg', [
                        '-y', '-v', 'error',
                        '-headers', 'User-Agent: Mozilla/5.0\r\n',
                        '-i', vUrl,
                        '-headers', 'User-Agent: Mozilla/5.0\r\n',
                        '-i', aUrl,
                        '-map', '0:v:0', '-map', '1:a:0',
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                        '-movflags', '+faststart',
                        destPath
                    ]);
                    const t = setTimeout(() => { try { ffmpeg.kill('SIGKILL'); } catch (err) { logger.warn('[YOUTUBEFALLBACK] falha ignorada: ' + (err && err.message)) } reject(new Error('timeout')); }, 300000);
                    ffmpeg.on('close', code => { clearTimeout(t); code === 0 ? resolve() : reject(new Error('code ' + code)); });
                    ffmpeg.on('error', err => { clearTimeout(t); reject(err); });
                });

                if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
                    logger.info(`[YOUTUBE RESILIENT] Invidious (${inst}) entregou vídeo MP4 de ${require('../../utils/tamanho').formatarTamanho(fs.statSync(destPath).size)}`);
                    return true;
                }
            }
        } catch (err) {
            logger.warn(`[YOUTUBE RESILIENT] Invidious ${inst} falhou: ${err.message}`);
        }
    }
    return false;
}

/**
 * Tenta cobalt.tools — retorna URL direta instantaneamente (sem polling)
 */
async function tryCobalt(videoId, format) {
    const instances = [
        "https://api.cobalt.tools",
        "https://cobalt.drgns.space",
        "https://cobalt.api.timeless.ovh",
        "https://cob.frootlab.xyz"
    ];
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const body = JSON.stringify({
        url,
        videoQuality: format === "mp3" ? "144" : String(Math.min(2160, require("./constants").MEDIA_LIMITS.MAX_VIDEO_HEIGHT)),
        audioFormat: format === "mp3" ? "mp3" : "best",
        // Sem isto o cobalt entrega 128 kbps (o padrão dele) e a música vinha
        // pior justamente pelo caminho mais usado, o de quando o YouTube barra
        // o yt-dlp.
        audioBitrate: "320",
        downloadMode: format === "mp3" ? "audio" : "auto",
        // Sem trava de H.264 (no YouTube ele para em 1080p). O arquivo que vier é
        // reembalado em MP4 por garantirMp4 e convertido só se precisar tocar na galeria.
        youtubeVideoCodec: "vp9"
    });
    for (const inst of instances) {
        try {
            const r = await fetch(`${inst}/`, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body,
                signal: AbortSignal.timeout(6000)
            });
            if (r.ok) {
                const d = await r.json();
                if (d && (d.status === "redirect" || d.status === "tunnel" || d.status === "stream") && d.url) return d.url;
                if (d && d.url) return d.url;
            }
        } catch (errIgnorado) { logger.warn(`[YOUTUBEFALLBACK] Falha ignorada em src/services/media/youtubeFallback.js:181: ${errIgnorado.message}`) }
    }
    return null;
}

/**
 * Tenta API Yt1s/SaveTube — variante sem polling
 */
async function tryYt1s(videoId, format) {
    try {
        const analyzeRes = await fetch("https://yt1s.com/api/ajaxSearch/index", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `q=https://www.youtube.com/watch?v=${videoId}&vt=${format === "mp3" ? "mp3" : "mp4"}`,
            signal: AbortSignal.timeout(8000)
        });
        if (!analyzeRes.ok) return null;
        const data = await analyzeRes.json();
        if (!data.links) return null;

        const category = format === "mp3" ? data.links.mp3 : data.links.mp4;
        if (!category) return null;

        // Pega melhor qualidade
        const best = Object.entries(category)
            .filter(([k, v]) => v && v.size && v.size !== "0B")
            .sort(([, a], [, b]) => {
                const qa = parseInt(a.q || 0);
                const qb = parseInt(b.q || 0);
                return qb - qa;
            })[0];

        if (!best) return null;
        const [, item] = best;

        const convRes = await fetch("https://yt1s.com/api/ajaxConvert/convert", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `vid=${videoId}&k=${item.k}`,
            signal: AbortSignal.timeout(10000)
        });
        if (!convRes.ok) return null;
        const convData = await convRes.json();
        return convData.dlink || null;
    } catch (_) { return null; }
}

/**
 * Resoluções pedidas ao loader.to, da maior para a menor. Até 2026-09-21 o
 * pedido era fixo em "1080" — e quando o YouTube barra a VPS (acontece com
 * frequência), é o loader.to que entrega o vídeo: 4K nunca chegava.
 * Medido na VPS em 2026-09-21: "4k" e "1440" ficam prontos em ~25 s; "8k" não
 * ficou pronto em 60 s (deixado de fora — prenderia o pedido sem entregar).
 */
const { MEDIA_LIMITS } = require("./constants");
// Cada formato com a altura que entrega; o teto do servidor (MEDIA_LIMITS.MAX_VIDEO_HEIGHT) corta
// o que ele não consegue converter para H.264 a tempo (ver constants.js).
const LOADER_TO_VIDEO = [["4k", 2160], ["1440", 1440], ["1080", 1080]]
    .filter(([, altura]) => altura <= MEDIA_LIMITS.MAX_VIDEO_HEIGHT)
    .map(([formato]) => formato);
if (LOADER_TO_VIDEO.length === 0) LOADER_TO_VIDEO.push("1080");

/** Um pedido ao loader.to num formato; devolve a URL do arquivo ou null. */
async function pedirLoaderTo(standardUrl, targetFmt, esperaMs) {
    const initUrl = `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${targetFmt}&url=${encodeURIComponent(standardUrl)}`;
    const initRes = await fetch(initUrl, { signal: AbortSignal.timeout(8000) });
    if (!initRes.ok) return null;
    const initData = await initRes.json();
    if (!initData.id) return null;

    const ate = Date.now() + esperaMs;
    while (Date.now() < ate) {
        await new Promise(r => setTimeout(r, 1000));
        try {
            const p = await fetch(`https://loader.to/ajax/progress.php?id=${initData.id}`, { signal: AbortSignal.timeout(5000) });
            if (!p.ok) continue;
            const pd = await p.json();
            if (pd.download_url && pd.download_url.trim()) return pd.download_url.trim();
            // O loader.to avisa quando o formato não existe para o vídeo.
            if (pd.success === 0 && /error|not available|indispon/i.test(String(pd.text || ""))) return null;
        } catch (err) {
            logger.warn(`[YOUTUBE RESILIENT] loader.to (${targetFmt}) não respondeu ao andamento: ${err.message}`);
        }
    }
    logger.warn(`[YOUTUBE RESILIENT] loader.to não aprontou ${targetFmt} em ${Math.round(esperaMs / 1000)} s`);
    return null;
}

/**
 * loader.to: a MAIOR resolução disponível (4K → 1440p → 1080p). Vídeo sem 4K
 * cai para a próxima em vez de ficar sem nada.
 */
async function tryLoaderTo(videoId, format) {
    const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const ordem = format === "mp3" ? ["mp3"] : LOADER_TO_VIDEO;
    for (const fmt of ordem) {
        try {
            const u = await pedirLoaderTo(standardUrl, fmt, fmt === "mp3" ? 30000 : 90000);
            if (u) {
                if (fmt !== "mp3") logger.info(`[YOUTUBE RESILIENT] loader.to entregou em ${fmt}`);
                return u;
            }
        } catch (err) {
            logger.warn(`[YOUTUBE RESILIENT] loader.to (${fmt}) falhou: ${err.message}`);
        }
    }
    return null;
}

/**
 * O arquivo salvo com nome .mp4 é MP4 de verdade? Serviços como o loader.to em
 * 4K entregam WebM (VP9/Opus). Aqui ele é reembalado em MP4 com `-c copy` —
 * sem mexer na imagem nem no som — para o nome não mentir sobre o conteúdo.
 */
async function garantirMp4(destPath) {
    const { spawnSync } = require("child_process");
    const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=format_name", "-of", "default=nw=1:nk=1", destPath], { encoding: "utf8", timeout: 20000 });
    const formato = String(probe.stdout || "").trim();
    if (!formato || /mp4|mov/.test(formato)) return;
    const tmp = destPath.replace(/\.mp4$/i, "") + "_remux.mp4";
    const r = spawnSync("ffmpeg", ["-y", "-v", "error", "-i", destPath, "-map", "0:v:0?", "-map", "0:a:0?", "-c", "copy", "-movflags", "+faststart", tmp], { timeout: 180000 });
    if (r.status === 0 && fs.existsSync(tmp) && fs.statSync(tmp).size > 0) {
        fs.renameSync(tmp, destPath);
        logger.info(`[YOUTUBE RESILIENT] Veio em ${formato}; reembalado em MP4 sem recodificar`);
    } else {
        try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch (err) { logger.warn(`[YOUTUBE RESILIENT] Sobrou ${tmp}: ${err.message}`); }
        logger.warn(`[YOUTUBE RESILIENT] Não reembalei ${formato} em MP4: ${String(r.stderr || "").slice(-200)}`);
    }
}

/**
 * Motor resiliente: race paralelo entre APIs — pega a primeira que responder
 * @param {string} url
 * @param {string} destPath
 * @param {'mp4'|'mp3'} format
 * @returns {Promise<boolean>}
 */
async function downloadYouTubeResilient(url, destPath, format = "mp4") {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return false;

    const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
    logger.info(`[YOUTUBE RESILIENT] Iniciando extração resiliente (${format}) para ${standardUrl}...`);

    // Garante diretório
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Race paralelo verdadeiro: todas as fontes disputam simultaneamente. A primeira que entregar vence!
    const raceDownload = () => new Promise(async (resolveRace) => {
        let won = false;
        const win = (data, name) => {
            if (!won) {
                won = true;
                logger.info(`[YOUTUBE RESILIENT] ✅ Race vencido por: ${name}`);
                resolveRace({ data, name });
            }
        };

        const strategies = [
            // Invidious faz download e conversão direta via FFmpeg
            downloadViaInvidious(videoId, destPath, format).then(ok => ok && win(destPath, "invidious")),
            // Cobalt entrega URL direta
            tryCobalt(videoId, format).then(u => u && win(u, "cobalt")),
            // Yt1s entrega URL direta
            tryYt1s(videoId, format).then(u => u && win(u, "yt1s")),
            // Loader.to (com polling interno rápido)
            new Promise(r => setTimeout(r, 100)).then(() => tryLoaderTo(videoId, format)).then(u => u && win(u, "loader.to"))
        ];

        await Promise.allSettled(strategies);
        if (!won) resolveRace(null);
    });

    try {
        const result = await raceDownload();
        if (!result) {
            logger.warn("[YOUTUBE RESILIENT] Todas as APIs falharam.");
            return false;
        }

        // Se o vencedor foi o Invidious, o arquivo já está em destPath pronto
        if (result.name === "invidious") {
            if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
                logger.info(`[YOUTUBE RESILIENT] ✅ Download completo: ${require('../../utils/tamanho').formatarTamanho(fs.statSync(destPath).size)} via invidious`);
                return true;
            }
        }

        // Se o vencedor entregou URL de download (loader.to, cobalt, yt1s), baixa agora
        if (result.data && typeof result.data === "string" && /^https?:\/\//i.test(result.data)) {
            logger.info(`[YOUTUBE RESILIENT] Baixando via ${result.name}...`);
            await streamToFile(result.data, destPath);
            if (format !== "mp3") await garantirMp4(destPath);

            if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
                logger.info(`[YOUTUBE RESILIENT] ✅ Download completo: ${require('../../utils/tamanho').formatarTamanho(fs.statSync(destPath).size)} via ${result.name}`);
                return true;
            }
        }
    } catch (err) {
        logger.error(`[YOUTUBE RESILIENT ERROR] ${err.message}`);
    }

    return false;
}

module.exports = {
    extractYouTubeVideoId,
    resolveYouTubeOEmbed,
    downloadYouTubeResilient
};
