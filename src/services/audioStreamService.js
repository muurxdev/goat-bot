/**
 * Audio Stream & High Fidelity Audio Service
 * Download e extração de áudios em MP3 de alta fidelidade, sem distorção ou slow
 */

const play = require("play-dl");
const https = require("https");
const yts = require("yt-search");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { tempDir } = require("../config/paths");
const { getPlatformDisplayName } = require("./media/formatResolver");
const { downloadYouTubeResilient, resolveYouTubeOEmbed } = require("./media/youtubeFallback");
const { buildYtDlpArgs, getYtDlpEnv } = require("./media/mediaArgs");
const { toMessage: mediaErrorMessage } = require("./media/mediaErrors");
const logger = require("../core/logger");

let scInitialized = false;

async function initSoundCloud() {
    try {
        const clientId = await play.getFreeClientID();
        if (clientId) {
            play.setToken({ soundcloud: { client_id: clientId } });
            scInitialized = true;
            logger.info("[AUDIO STREAM] SoundCloud client_id inicializado.");
        }
    } catch (err) {
        logger.warn("[AUDIO STREAM] SoundCloud token init warn:", err.message);
    }
}

/**
 * Converte stream de áudio para MP3 via ffmpeg
 */
function streamToMp3(inputStream, outputPath) {
    return new Promise((resolve, reject) => {
        // Sem `-ar` nem `-ac`: a taxa de amostragem e os canais da FONTE são
        // preservados. Forçar 44,1 kHz reamostrava todo áudio de 48 kHz (a maior
        // parte do YouTube) e forçar 2 canais criava um "estéreo" falso a partir
        // de mono. Nenhum dos dois acrescentava informação — só tirava.
        const ffmpeg = spawn("ffmpeg", [
            "-threads", "0",
            "-i", "pipe:0",
            "-vn",
            "-c:a", "libmp3lame",
            "-b:a", "320k",
            "-q:a", "0",
            "-id3v2_version", "3",
            "-avoid_negative_ts", "make_zero",
            "-y",
            outputPath
        ]);

        inputStream.pipe(ffmpeg.stdin);

        let stderr = "";
        ffmpeg.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        ffmpeg.on("close", (code) => {
            if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                resolve(outputPath);
            } else {
                reject(new Error(`FFmpeg falhou ao processar áudio (code: ${code}): ${stderr.slice(-200)}`));
            }
        });

        ffmpeg.on("error", (err) => {
            reject(new Error(`Erro ao iniciar FFmpeg: ${err.message}`));
        });

        inputStream.on("error", (err) => {
            ffmpeg.kill();
            reject(new Error(`Erro na leitura do stream de áudio: ${err.message}`));
        });
    });
}

/**
 * Detecta se um título contém modificadores indesejados (slowed, reverb, sped up)
 */
function hasUndesiredModifier(title, query) {
    const lowerTitle = (title || "").toLowerCase();
    const lowerQuery = (query || "").toLowerCase();
    const badWords = ["slowed", "slow", "reverb", "sped up", "speed up", "nightcore", "8d audio", "pitched", "slow version"];
    for (const bad of badWords) {
        if (lowerTitle.includes(bad) && !lowerQuery.includes(bad)) {
            return true;
        }
    }
    return false;
}

/**
 * Extrai metadados completos de links do YouTube / YouTube Music
 */
async function resolveYouTubeMetadata(url) {
    const oembed = await resolveYouTubeOEmbed(url);
    if (oembed && oembed.title && oembed.title !== "Vídeo do YouTube") {
        return oembed;
    }

    const idMatch = url.match(/(?:v=|\/|youtu\.be\/|watch\?v=)([0-9A-Za-z_-]{11})/);
    if (!idMatch) return null;

    const videoId = idMatch[1];
    const { getBestYouTubeThumbnail, upgradeThumbnail } = require("./media/thumbnailResolver");
    const officialThumb = await getBestYouTubeThumbnail(videoId);
    const standardUrl = "https://www.youtube.com/watch?v=" + videoId;

    try {
        const r = await yts({ videoId });
        if (r && r.title) {
            const bestThumb = await upgradeThumbnail(r.thumbnail || videoId);
            return {
                title: r.title,
                author: r.author?.name || "YouTube",
                thumbnail: bestThumb || officialThumb,
                durationFormatted: r.timestamp || "—",
                durationSeconds: r.seconds || 0,
                url: r.url || standardUrl,
                uploadDate: r.uploadDate || r.ago || null
            };
        }
    } catch (errIgnorado) { logger.warn(`[AUDIOSTREAMSERVICE] Falha ignorada em src/services/audioStreamService.js:126: ${errIgnorado.message}`) }

    return {
        title: "Áudio do YouTube",
        author: "YouTube",
        thumbnail: officialThumb,
        durationFormatted: "—",
        durationSeconds: 0,
        url: standardUrl
    };
}

/**
 * Extrai metadados completos de faixas do Spotify (oEmbed + Embed Scraping)
 */
async function resolveSpotifyMetadata(url) {
    let title = "";
    let author = "";
    let primaryArtist = "";
    let durationFormatted = "";
    let durationSeconds = 0;
    let thumbnail = "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=600";

    const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    const trackId = trackIdMatch ? trackIdMatch[1] : null;

    if (trackId) {
        try {
            const embedUrl = "https://open.spotify.com/embed/track/" + trackId;
            const embedRes = await fetch(embedUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
                signal: AbortSignal.timeout(6000)
            });
            if (embedRes.ok) {
                const html = await embedRes.text();
                const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
                if (nextMatch) {
                    const data = JSON.parse(nextMatch[1]);
                    const entity = data.props?.pageProps?.state?.data?.entity;
                    if (entity) {
                        title = entity.name || "";
                        primaryArtist = entity.artists?.[0]?.name || "";
                        author = entity.artists?.map(a => a.name).join(", ") || "";
                        const durMs = entity.duration || 0;
                        if (durMs > 0) {
                            const sec = Math.round(durMs / 1000);
                            durationSeconds = sec;
                            durationFormatted = Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
                        }
                        // image[0] é 300 px; a lista traz até 640 px. Pega a maior.
                        const imagens = (entity.visualIdentity?.image || []).filter(i => i && i.url);
                        if (imagens.length) {
                            thumbnail = imagens.reduce((a, b) => ((b.maxWidth || 0) > (a.maxWidth || 0) ? b : a)).url;
                        }
                    }
                }
            }
        } catch (errIgnorado) { logger.warn(`[AUDIOSTREAMSERVICE] Falha ignorada em src/services/audioStreamService.js:183: ${errIgnorado.message}`) }
    }

    if (!title) {
        try {
            const oembedUrl = "https://open.spotify.com/oembed?url=" + encodeURIComponent(url);
            const oembedRes = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
            if (oembedRes.ok) {
                const data = await oembedRes.json();
                title = data.title || "Música do Spotify";
                thumbnail = data.thumbnail_url || thumbnail;
            }
        } catch (errIgnorado) { logger.warn(`[AUDIOSTREAMSERVICE] Falha ignorada em src/services/audioStreamService.js:195: ${errIgnorado.message}`) }
    }

    // Prioriza TÍTULO PRIMEIRO para que o YouTube busque a obra específica,
    // e usa o primeiro artista (principal) para evitar poluição com múltiplos feats.
    const searchArtist = primaryArtist || (author ? author.split(',')[0].trim() : "");
    const searchTerm = (title && searchArtist)
        ? `${title} - ${searchArtist}`
        : (title || url);

    return {
        title: title || "Música do Spotify",
        author: author || "Spotify",
        primaryArtist: searchArtist,
        durationFormatted: durationFormatted || "—",
        durationSeconds,
        thumbnail,
        url,
        searchTerm
    };
}

/**
 * Baixa áudio diretamente via yt-dlp usando PO-Token e argumentos centralizados
 */
function downloadDirectYtDlpAudio(targetUrl, outputPath) {
    return new Promise((resolve, reject) => {
        const baseArgs = buildYtDlpArgs([
            "-f", "bestaudio/best",
            "-S", "abr,asr,acodec",
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "320K",
            "--postprocessor-args", "FFmpegExtractAudio:-c:a libmp3lame -b:a 320k -q:a 0",
            "--embed-thumbnail",
            "--add-metadata",
            "--no-playlist",
            "--no-warnings",
            // stdout não é lido: o andamento do download enchia o pipe e o yt-dlp parava.
            "--quiet", "--no-progress",
            "-o", outputPath,
            targetUrl
        ]);

        const proc = spawn("yt-dlp", baseArgs, {
            env: getYtDlpEnv(),
            stdio: ["ignore", "ignore", "pipe"]
        });

        // Sem teto, um yt-dlp travado ficava preso para sempre e ocupava uma das
        // duas vagas da fila de mídia de TODOS os usuários (a fila só libera a
        // vaga quando o download termina). Mata o processo e deixa o fallback agir.
        const limiteMs = Number(process.env.AUDIO_DOWNLOAD_TIMEOUT_MS) || 6 * 60 * 1000;
        let estourou = false;
        const timer = setTimeout(() => {
            estourou = true;
            logger.warn(`[AUDIO YT-DLP] ${targetUrl} passou de ${Math.round(limiteMs / 1000)}s; encerrando o yt-dlp.`);
            proc.kill("SIGKILL");
        }, limiteMs);

        let stderrData = "";
        proc.stderr.on("data", d => { stderrData += d.toString(); });

        proc.on("close", code => {
            clearTimeout(timer);
            if (estourou) {
                reject(new Error(`O download do áudio passou de ${Math.round(limiteMs / 60000)} minutos e foi cancelado.`));
                return;
            }
            if (code === 0 && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                resolve(outputPath);
            } else {
                const friendlyMsg = mediaErrorMessage("Falha ao baixar áudio do YouTube", stderrData);
                reject(new Error(friendlyMsg));
            }
        });
        proc.on("error", reject);
    });
}

/**
 * Acabamento comum a todos os caminhos de download: capa e ficha no arquivo,
 * código do post, cache e tempo total.
 *
 * Fica aqui, e não em cada `return`, porque são sete caminhos de download
 * diferentes (yt-dlp, engine resiliente, SoundCloud, Spotify…) e só o do
 * yt-dlp já entregava o MP3 com capa.
 */
async function wrapAudioSuccess(result, query, startedAt) {
    try {
        const { extrairCodigo } = require("./media/formatResolver");
        if (!result.id) result.id = extrairCodigo(result.url);
    } catch (e) {
        logger.warn(`[AUDIO] Não descobri o código do post: ${e.message}`);
    }

    try {
        const { embutirCapaETags } = require("./media/artworkEmbedder");
        await embutirCapaETags(result.filePath, {
            thumbnail: result.thumbnail,
            title: result.title,
            author: result.author,
            year: result.year
        });
    } catch (e) {
        logger.warn(`[AUDIO CAPA] Falha ao embutir a capa: ${e.message}`);
    }

    result.elapsedMs = Date.now() - startedAt;
    try {
        const mediaCache = require("./media/mediaCacheService");
        mediaCache.set(query.trim(), "mp3", "default", result.filePath, {
            title: result.title,
            author: result.author,
            durationFormatted: result.durationFormatted,
            thumbnail: result.thumbnail,
            url: result.url,
            platform: result.platform,
            uploadDate: result.uploadDate || null,
            views: result.views || 0,
            id: result.id || null
        });
    } catch (e) {
        logger.warn(`[AUDIO CACHE] Falha ao salvar no cache: ${e.message}`);
    }
    return result;
}

/**
 * Pesquisa e baixa áudio de alta fidelidade convertido para MP3
 * @param {string} query - Nome da música ou URL direta
 * @returns {Promise<object>}
 */
async function searchAndDownloadAudio(query) {
    const startedAt = Date.now();

    // 0. Cache hit instantâneo em disco (<50ms)
    try {
        const mediaCache = require("./media/mediaCacheService");
        const cached = mediaCache.get(query.trim(), "mp3", "default");
        if (cached && fs.existsSync(cached.filePath)) {
            logger.info(`[AUDIO CACHE HIT] Servido do cache em ${Date.now() - startedAt}ms: ${cached.filePath}`);
            return {
                filePath: cached.filePath,
                elapsedMs: Date.now() - startedAt,
                title: cached.meta?.title || "Música",
                author: cached.meta?.author || "Artista",
                durationFormatted: cached.meta?.durationFormatted || "—",
                thumbnail: cached.meta?.thumbnail || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600",
                url: cached.meta?.url || query.trim(),
                // Guardados junto com o arquivo: sem isso a segunda pessoa a pedir
                // a mesma música recebia a legenda sem data de publicação.
                uploadDate: cached.meta?.uploadDate || null,
                views: cached.meta?.views || 0,
                id: cached.meta?.id || null,
                isVideo: false,
                isAudio: true,
                mimetype: "audio/mpeg",
                platform: cached.meta?.platform || "Cache",
                jobId: "cached_" + Date.now(),
                fromCache: true
            };
        }
    } catch (cacheErr) {
        logger.warn(`[AUDIO CACHE] Falha na consulta prévia: ${cacheErr.message}`);
    }

    const jobId = "audio_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const audioTempDir = path.join(tempDir, "audio");
    if (!fs.existsSync(audioTempDir)) {
        fs.mkdirSync(audioTempDir, { recursive: true });
    }

    const outputPath = path.join(audioTempDir, jobId + ".mp3");
    const isDirectUrl = /^https?:\/\//i.test(query.trim());
    const isSpotify = /spotify\.com/i.test(query.trim());
    const platform = isSpotify ? "Spotify" : getPlatformDisplayName(query);

    let title = "Música";
    let author = "Artista";
    let primaryArtist = "";
    let durationFormatted = "—";
    let durationSeconds = 0;
    let thumbnail = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600";
    let sourceUrl = query.trim();
    let searchTerm = query.trim();

    // 1. CASO SPOTIFY
    if (isSpotify) {
        const spMeta = await resolveSpotifyMetadata(query.trim());
        title = spMeta.title;
        author = spMeta.author;
        primaryArtist = spMeta.primaryArtist || "";
        durationFormatted = spMeta.durationFormatted;
        durationSeconds = spMeta.durationSeconds || 0;
        thumbnail = spMeta.thumbnail;
        sourceUrl = spMeta.url;
        searchTerm = spMeta.searchTerm || (title + " - " + (primaryArtist || author));
    }
    // 2. CASO URL DIRETA (YouTube, YouTube Music, etc.)
    else if (isDirectUrl) {
        if (/youtu(\.be|be\.com)/i.test(query)) {
            const ytMeta = await resolveYouTubeMetadata(query);
            if (ytMeta) {
                title = ytMeta.title;
                author = ytMeta.author;
                durationFormatted = ytMeta.durationFormatted;
                durationSeconds = ytMeta.durationSeconds || 0;
                thumbnail = ytMeta.thumbnail;
                sourceUrl = ytMeta.url;
                searchTerm = title + " " + author;
            }
        }

        // 2.1 Tenta baixar diretamente do link original via yt-dlp
        try {
            await downloadDirectYtDlpAudio(sourceUrl, outputPath);
            return wrapAudioSuccess({
                filePath: outputPath,
                title,
                author,
                durationFormatted,
                thumbnail,
                url: sourceUrl,
                uploadDate: (typeof ytMeta !== "undefined" && ytMeta?.uploadDate) ? ytMeta.uploadDate : null,
                views: (typeof ytMeta !== "undefined" && ytMeta?.views) || 0,
                isVideo: false,
                isAudio: true,
                mimetype: "audio/mpeg",
                platform,
                jobId
            }, query, startedAt);
        } catch (ytDlpErr) {
            logger.warn("[AUDIO DIRECT DOWNLOAD WARN] " + ytDlpErr.message + ", tentando fallback resiliente...");

            if (/youtu(\.be|be\.com)/i.test(sourceUrl)) {
                try {
                    const ok = await downloadYouTubeResilient(sourceUrl, outputPath, "mp3");
                    if (ok && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                        return wrapAudioSuccess({
                            filePath: outputPath,
                            title,
                            author,
                            durationFormatted,
                            thumbnail,
                            url: sourceUrl,
                            uploadDate: (typeof ytMeta !== "undefined" && ytMeta?.uploadDate) ? ytMeta.uploadDate : null,
                            views: (typeof ytMeta !== "undefined" && ytMeta?.views) || 0,
                            isVideo: false,
                            isAudio: true,
                            mimetype: "audio/mpeg",
                            platform,
                            jobId
                        }, query, startedAt);
                    }
                } catch (errIgnorado) { logger.warn(`[AUDIOSTREAMSERVICE] Falha ignorada em src/services/audioStreamService.js:448: ${errIgnorado.message}`) }
            } else {
                // Para links de outras redes (TikTok, Kwai, Instagram, Twitter, etc.)
                try {
                    const { downloadMedia } = require("./mediaEngine");
                    const dlResult = await downloadMedia({
                        url: sourceUrl,
                        format: "mp3",
                        source: sourceUrl
                    });
                    const resPath = dlResult?.filePath || dlResult?.primaryFile || (dlResult?.files && dlResult.files[0]);
                    if (resPath && fs.existsSync(resPath)) {
                        return wrapAudioSuccess({
                            filePath: resPath,
                            title: dlResult.title || title,
                            author: dlResult.author || author,
                            durationFormatted: dlResult.durationFormatted || durationFormatted,
                            thumbnail: dlResult.thumbnail || thumbnail,
                            url: sourceUrl,
                            uploadDate: dlResult.uploadDate,
                            year: dlResult.year,
                            isVideo: false,
                            isAudio: true,
                            mimetype: "audio/mpeg",
                            platform: dlResult.platform || platform,
                            jobId
                        }, query, startedAt);
                    }
                } catch (otherErr) {
                    logger.warn("[AUDIO DIRECT OTHER PLATFORM WARN] " + otherErr.message);
                }
                // Se for URL direta de outra plataforma e falhar, não pesquisa URL como texto no YouTube
                throw new Error(`Não foi possível extrair o áudio do link fornecido (${platform}). Verifique se o post é público e tente novamente.`);
            }
        }
    }

    // 3. BUSCA UNIVERSAL NO YOUTUBE (yt-search + Ranqueamento Inteligente + yt-dlp + Fallback Resiliente)
    try {
        const searchResults = await yts(searchTerm);
        if (searchResults && Array.isArray(searchResults.videos) && searchResults.videos.length > 0) {
            // Filtra descartando vídeos < 30s ou > 900s e descartando slowed/nightcore caso não solicitados.
            // Exceção: título igual ao pedido fica mesmo curto. Sem ela, ".play me at
            // the zoo" (19 s) nem chegava ao ranking e saía um vídeo SOBRE ele.
            const { normalizar } = require("./media/searchRanker");
            const pedidoNorm = normalizar(searchTerm);
            const fullVideos = searchResults.videos.filter(v =>
                (v.seconds && v.seconds >= 30 && v.seconds <= 900) || !v.seconds || normalizar(v.title) === pedidoNorm);
            const cleanVideos = fullVideos.filter(v => !hasUndesiredModifier(v.title, query));
            const pool = cleanVideos.length > 0 ? cleanVideos : (fullVideos.length > 0 ? fullVideos : searchResults.videos);

            // Ranqueamento inteligente: avalia frase exata, canal do artista e duração esperada
            const { ranquear } = require("./media/searchRanker");
            const candidatos = pool.map(v => ({
                id: v.videoId,
                title: v.title || "Sem título",
                author: v.author?.name || "Desconhecido",
                duration: v.seconds || 0,
                durationFormatted: v.timestamp || "",
                thumbnail: v.thumbnail || v.image || "",
                views: v.views || 0,
                url: v.url || `https://www.youtube.com/watch?v=${v.videoId}`,
                rawVideo: v
            }));

            const rankOpts = {
                expectedTitle: isSpotify ? title : undefined,
                expectedArtist: isSpotify ? (primaryArtist || author) : undefined,
                expectedDuration: durationSeconds > 0 ? durationSeconds : undefined
            };

            const ordenados = ranquear(searchTerm, candidatos, rankOpts);
            const topCandidate = ordenados[0] || candidatos[0];
            const selectedVideo = topCandidate.rawVideo || topCandidate;

            if (selectedVideo) {
                const ytUrl = selectedVideo.url || `https://www.youtube.com/watch?v=${selectedVideo.videoId}`;
                if (!isSpotify) {
                    title = selectedVideo.title || title;
                    author = selectedVideo.author?.name || selectedVideo.author || author;
                    durationFormatted = selectedVideo.timestamp || selectedVideo.durationFormatted || durationFormatted;
                    const { upgradeThumbnail } = require("./media/thumbnailResolver");
                    thumbnail = (await upgradeThumbnail(selectedVideo.thumbnail || selectedVideo.videoId)) || thumbnail;
                    sourceUrl = ytUrl;
                }

                logger.info(`[AUDIO SEARCH YT] Selecionado: "${selectedVideo.title}" (${ytUrl}) | Score: ${topCandidate._score} [${topCandidate._motivos?.join("; ")}]`);

                // 3.1 Tentativa com yt-dlp com PO-Token
                try {
                    await downloadDirectYtDlpAudio(ytUrl, outputPath);
                    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                        return wrapAudioSuccess({
                            filePath: outputPath,
                            title,
                            author,
                            durationFormatted,
                            thumbnail,
                            url: isSpotify ? query.trim() : sourceUrl,
                            uploadDate: selectedVideo.uploadDate || selectedVideo.ago || null,
                            views: selectedVideo.views || selectedVideo.viewCount || 0,
                            isVideo: false,
                            isAudio: true,
                            mimetype: "audio/mpeg",
                            platform: isSpotify ? "Spotify" : "YouTube",
                            jobId
                        }, query, startedAt);
                    }
                } catch (errYt) {
                    logger.warn(`[AUDIO YT-DLP WARN] ${errYt.message}, acionando fallback resiliente...`);
                }

                // 3.2 Tentativa com Fallback Resiliente (loader.to / cobalt / yt1s)
                try {
                    const ok = await downloadYouTubeResilient(ytUrl, outputPath, "mp3");
                    if (ok && fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
                        return wrapAudioSuccess({
                            filePath: outputPath,
                            title,
                            author,
                            durationFormatted,
                            thumbnail,
                            url: isSpotify ? query.trim() : sourceUrl,
                            uploadDate: selectedVideo.uploadDate || selectedVideo.ago || null,
                            views: selectedVideo.views || selectedVideo.viewCount || 0,
                            isVideo: false,
                            isAudio: true,
                            mimetype: "audio/mpeg",
                            platform: isSpotify ? "Spotify" : "YouTube",
                            jobId
                        }, query, startedAt);
                    }
                } catch (errRes) {
                    logger.warn(`[AUDIO RESILIENT WARN] ${errRes.message}`);
                }
            }
        }
    } catch (ytSearchErr) {
        logger.warn(`[AUDIO YT SEARCH WARN] ${ytSearchErr.message}`);
    }

    // 4. FALLBACK EM SOUNDCLOUD
    if (!scInitialized) {
        await initSoundCloud();
    }

    try {
        let scResults = await play.search(searchTerm, { source: { soundcloud: "tracks" }, limit: 25 });
        if (scResults && scResults.length > 0) {
            const fullTracks = scResults.filter(t => t.durationInSec && t.durationInSec > 45 && t.durationInSec < 700);
            const cleanTracks = fullTracks.filter(t => !hasUndesiredModifier(t.name || t.title, query));
            const pool = cleanTracks.length > 0 ? cleanTracks : (fullTracks.length > 0 ? fullTracks : scResults);

            const { ranquear } = require("./media/searchRanker");
            const scCandidatos = pool.map(t => ({
                id: t.id,
                title: t.name || t.title || "Sem título",
                author: t.user?.name || "SoundCloud",
                duration: t.durationInSec || 0,
                url: t.url,
                rawTrack: t
            }));

            const scOrdenados = ranquear(searchTerm, scCandidatos, {
                expectedTitle: isSpotify ? title : undefined,
                expectedArtist: isSpotify ? (primaryArtist || author) : undefined,
                expectedDuration: durationSeconds > 0 ? durationSeconds : undefined
            });

            const topSc = scOrdenados[0] || scCandidatos[0];
            const selectedTrack = topSc.rawTrack || topSc;

            if (selectedTrack) {
                const stream = await play.stream(selectedTrack.url);
                await streamToMp3(stream.stream, outputPath);

                const finalDuration = (durationFormatted && durationFormatted !== "—")
                    ? durationFormatted
                    : (selectedTrack.durationInSec ? Math.floor(selectedTrack.durationInSec / 60) + ":" + String(selectedTrack.durationInSec % 60).padStart(2, "0") : "—");

                return wrapAudioSuccess({
                    filePath: outputPath,
                    title: isSpotify ? title : (selectedTrack.name || title),
                    author: isSpotify ? author : (selectedTrack.user?.name || author),
                    durationFormatted: finalDuration,
                    thumbnail: (thumbnail && !thumbnail.includes("unsplash")) ? thumbnail : (selectedTrack.artwork_url ? selectedTrack.artwork_url.replace("-large", "-t500x500") : thumbnail),
                    url: isSpotify ? query.trim() : (sourceUrl || selectedTrack.url),
                    isVideo: false,
                    isAudio: true,
                    mimetype: "audio/mpeg",
                    platform: isSpotify ? "Spotify" : (platform || "SoundCloud"),
                    jobId
                }, query, startedAt);
            }
        }
    } catch (scErr) {
        logger.error("[SOUNDCLOUD SEARCH/STREAM ERROR]", scErr);
    }

    if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        throw new Error("Não foi possível encontrar nem processar o áudio desta faixa.");
    }

    return wrapAudioSuccess({
        filePath: outputPath,
        title,
        author,
        durationFormatted,
        thumbnail,
        url: sourceUrl,
        isVideo: false,
        isAudio: true,
        mimetype: "audio/mpeg",
        platform,
        jobId
    }, query, startedAt);
}

/**
 * Detecta e resolve todas as faixas de uma Playlist ou Álbum (Spotify, YouTube, SoundCloud)
 */
/** Teto de faixas por playlist de áudio (YouTube e Spotify). */
const LIMITE_FAIXAS_PLAYLIST = Math.max(1, Number(process.env.PLAYLIST_AUDIO_MAX_FAIXAS) || 25);

/**
 * É link de PLAYLIST do YouTube (e não uma música tocada dentro de uma)?
 * "youtube.com/playlist?list=X" é; "watch?v=Y&list=X" e "youtu.be/Y?list=X" não.
 */
function ehPlaylistDoYouTube(url) {
    const u = String(url || "");
    if (!/[?&]list=[0-9A-Za-z_-]+/i.test(u)) return false;
    if (/youtube\.com\/playlist\?/i.test(u)) return true;
    return !/[?&]v=[\w-]{11}|youtu\.be\/[\w-]{11}/i.test(u);
}

async function resolvePlaylistTracks(url) {
    if (!url || typeof url !== "string") return null;
    const cleanUrl = url.trim();

    // 1. SPOTIFY PLAYLIST / ALBUM
    const spotifyPlaylistMatch = cleanUrl.match(/open\.spotify\.com\/(playlist|album)\/([a-zA-Z0-9]+)/i);
    if (spotifyPlaylistMatch) {
        const type = spotifyPlaylistMatch[1];
        const id = spotifyPlaylistMatch[2];
        try {
            const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
            const res = await fetch(embedUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
                signal: AbortSignal.timeout(8000)
            });
            if (res.ok) {
                const html = await res.text();
                const nextMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
                if (nextMatch) {
                    const data = JSON.parse(nextMatch[1]);
                    const entity = data.props?.pageProps?.state?.data?.entity;
                    if (entity && Array.isArray(entity.trackList) && entity.trackList.length > 0) {
                        const tracks = entity.trackList.slice(0, LIMITE_FAIXAS_PLAYLIST).map(t => {
                            const trackTitle = t.title || "Música";
                            const trackArtist = t.subtitle || entity.name || "Spotify";
                            const durSec = t.duration ? Math.round(t.duration / 1000) : 0;
                            const durStr = durSec > 0 ? (Math.floor(durSec / 60) + ":" + String(durSec % 60).padStart(2, "0")) : "—";
                            return {
                                title: trackTitle,
                                author: trackArtist,
                                searchTerm: `${trackTitle} - ${trackArtist}`,
                                duration: durStr,
                                url: cleanUrl
                            };
                        });

                        return {
                            isPlaylist: true,
                            title: entity.name || (type === "album" ? "Álbum do Spotify" : "Playlist do Spotify"),
                            platform: "Spotify",
                            type: type === "album" ? "Álbum" : "Playlist",
                            total: tracks.length,
                            tracks
                        };
                    }
                }
            }
        } catch (err) {
            logger.warn(`[SPOTIFY PLAYLIST RESOLVER WARN] ${err.message}`);
        }
    }

    // 2. YOUTUBE PLAYLIST (yt-dlp flat-playlist)
    //
    // Só link de playlist de verdade. "watch?v=X&list=Y" é a música que a pessoa
    // compartilhou de dentro de uma lista (ou de um mix "RD…", que é uma rádio
    // quase sem fim): antes virava a playlist inteira, sem limite de faixas.
    if (!ehPlaylistDoYouTube(cleanUrl)) return null;
    const ytListMatch = cleanUrl.match(/[?&]list=([0-9A-Za-z_-]+)/i);
    if (ytListMatch) {
        try {
            const listJson = await new Promise((resolve, reject) => {
                const baseArgs = buildYtDlpArgs([
                    "--flat-playlist",
                    "-J",
                    "--no-warnings",
                    "--playlist-end", String(LIMITE_FAIXAS_PLAYLIST),
                    cleanUrl
                ]);
                const proc = spawn("yt-dlp", baseArgs, { env: getYtDlpEnv() });
                const timer = setTimeout(() => proc.kill("SIGKILL"), 90 * 1000);
                let data = "";
                proc.stdout.on("data", d => { data += d.toString(); });
                proc.on("close", code => {
                    clearTimeout(timer);
                    if (code === 0 && data) {
                        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
                    } else {
                        reject(new Error("Falha ao extrair playlist"));
                    }
                });
                proc.on("error", reject);
            });

            if (listJson && Array.isArray(listJson.entries) && listJson.entries.length > 0) {
                const tracks = listJson.entries.map(e => {
                    const durSec = Number(e.duration || 0);
                    const durStr = durSec > 0 ? (Math.floor(durSec / 60) + ":" + String(durSec % 60).padStart(2, "0")) : "—";
                    return {
                        title: e.title || "Faixa do YouTube",
                        author: e.uploader || e.channel || "YouTube",
                        searchTerm: e.url || (e.id ? `https://www.youtube.com/watch?v=${e.id}` : e.title),
                        duration: durStr,
                        url: e.url || (e.id ? `https://www.youtube.com/watch?v=${e.id}` : cleanUrl)
                    };
                });

                return {
                    isPlaylist: true,
                    title: listJson.title || "Playlist do YouTube",
                    platform: "YouTube",
                    type: "Playlist",
                    total: tracks.length,
                    tracks
                };
            }
        } catch (err) {
            logger.warn(`[YOUTUBE PLAYLIST RESOLVER WARN] ${err.message}`);
        }
    }

    return null;
}

module.exports = {
    searchAndDownloadAudio,
    resolvePlaylistTracks,
    resolveSpotifyMetadata,
    resolveYouTubeMetadata,
    ehPlaylistDoYouTube,
    LIMITE_FAIXAS_PLAYLIST
};
