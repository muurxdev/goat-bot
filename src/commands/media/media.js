/**
 * Comando Central .media / .video / .play
 * Central unificada de download inteligente de vídeos, músicas e playlists de toda a web
 */

const { avisarDownload } = require('../../services/media/avisoDownload')
const fs = require("fs");
const path = require("path");
const { downloadTikTokVideo } = require("../../services/media/providers/tiktok");
const { downloadTwitterVideo } = require("../../services/media/providers/twitter");
const { downloadKwaiVideo } = require("../../services/media/providers/kwai");
const { downloadPinterestMedia } = require("../../services/pinterestService");
const { searchAndDownloadAudio, resolvePlaylistTracks } = require("../../services/audioStreamService");
const { extractMetadata, downloadMedia, looksLikeUrl } = require("../../services/mediaEngine");
const { getPlatformDisplayName, formatMediaCaption, calcularTempoComando } = require("../../services/media/formatResolver");
const { mediaQueue } = require("../../services/mediaQueue");
const { extractUrlAndFormat } = require("../../services/media/urlExtractor");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");
const { enviarAudio } = require('../../services/media/audioSender');
const { enviarVideo } = require('../../services/media/videoSender')
const { falaDeErro } = require('../../services/media/mediaErrors');

module.exports = {
    name: "media",
    aliases: ["download", "dl", "baixar", "baixarmidia", "mp4", "video", "baixarvideo", "mp3"],
    category: "media",
    description: "Central inteligente de download de mídias e playlists de toda a Web (YouTube, Spotify, Kwai, TikTok, Twitter/X, Pinterest, Instagram)",
    cooldownMs: 3000,
    execute: async ({ sender, text, reply, client, from, info, quotedText, commandName }) => {
        const inicioDownload = Date.now();
        const botName = getBotName();
        const rawInput = (text || quotedText || "").trim();

        if (!rawInput) {
            let doc = "📥 *Como baixar da internet*\n";
            doc += "• `.media mp4 <link>` ou `.video <link>` — mando o vídeo\n";
            doc += "• `.media mp3 <link>` ou `.play <nome ou link>` — mando o áudio\n";
            doc += "• `.media <link de playlist ou álbum>` — mando a lista inteira\n\n";
            doc += "Funciona com YouTube, Spotify, TikTok, Kwai, Twitter/X, Pinterest, Instagram, Reddit, SoundCloud e Facebook.\n";
            doc += "Também dá para responder a uma mensagem com link usando `.media mp3` ou `.media mp4`.";

            if (process.env.NODE_ENV === 'test') {
                return reply(doc.trim());
            }

            const { sendMenuMediaMessage } = require("../../utils/wallpapers");
            return await sendMenuMediaMessage(client, from, {
                category: "media",
                text: doc,
                quoted: info
            });
        }

        const isCommandMp3 = ["mp3", "playmp3"].includes(commandName?.toLowerCase());
        const isCommandMp4 = ["mp4", "video", "baixarvideo"].includes(commandName?.toLowerCase());
        const defaultFormat = isCommandMp4 ? "mp4" : "mp3";

        const { url: cleanUrl, isMp3: hasMp3Flag, isMp4: hasMp4Flag, cleanQuery: queryWithoutFormat } = extractUrlAndFormat(rawInput, defaultFormat);
        const isMp4 = isCommandMp4 || hasMp4Flag;
        const isMp3 = isCommandMp3 || hasMp3Flag || (!isMp4);
        const cleanQuery = cleanUrl || queryWithoutFormat;

        if (client && from && info?.key) {
            try { await client.sendMessage(from, { react: { text: '⏳', key: info.key } }); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:64: ${errIgnorado.message}`) }
        }

        // Plataforma decidida pelo HOST do link (plataformas.js). O teste antigo
        // por pedaço de texto mandava link do Dropbox para o baixador do Twitter
        // ("dropbox.com" termina em "x.com") e qualquer site com "?ref=tiktok.com"
        // para o do TikTok.
        const { identificarLink } = require("../../services/media/plataformas");
        const link = cleanUrl ? identificarLink(cleanUrl) : { chave: 'busca', nome: 'YouTube', tipo: isMp3 ? 'áudio' : 'vídeo' };
        const isKwai = link.chave === 'kwai';
        const isTikTok = link.chave === 'tiktok';
        const isTwitter = link.chave === 'twitter';
        const isPinterest = link.chave === 'pinterest';
        const isInstagram = link.chave === 'instagram';
        const isSpotify = link.chave === 'spotify';
        const isYouTube = link.chave === 'youtube' || link.chave === 'youtubemusic';
        const isFacebook = link.chave === 'facebook';
        const platformName = cleanUrl ? link.nome : getPlatformDisplayName(cleanQuery);

        // 1. SUPORTE A PLAYLISTS E ÁLBUNS COMPLETOS (Spotify & YouTube)
        if (cleanUrl) {
            const playlistInfo = await resolvePlaylistTracks(cleanUrl);
            if (playlistInfo && playlistInfo.isPlaylist && playlistInfo.tracks.length > 0) {
                // Playlist de áudio no chat: ficha e áudio (com a capa anexada) em cada
                // faixa, andamento numa mensagem só e resumo no fim
                // (src/services/media/playlistAudio.js).
                const { enviarPlaylistDeAudio } = require("../../services/media/playlistAudio");
                await enviarPlaylistDeAudio({
                    client, from, info, reply, sender, playlist: playlistInfo,
                    preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                });
                return;
            }
        }

        // 2. PINTEREST NATIVO
        if (isPinterest) {
            // No Pinterest só se sabe se é foto ou vídeo depois de baixar.
            const aviso = avisarDownload({ client, from, info, reply, url: cleanQuery, isAudio: isMp3, tipo: isMp3 ? 'áudio' : (isMp4 ? 'vídeo' : 'imagem ou vídeo'), plataforma: "Pinterest", textoSimples: "⏳ Baixando do Pinterest…", userJid: sender });
            try {
                const mediaData = await mediaQueue.enqueue({
                    url: cleanQuery,
                    format: isMp3 ? "mp3" : "mp4",
                    user: sender,
                    runFn: () => downloadPinterestMedia(cleanQuery, { format: isMp3 ? "mp3" : "mp4" })
                });
                await aviso;

                if (mediaData.images && Array.isArray(mediaData.images) && mediaData.images.length > 1) {
                    const total = mediaData.images.length;
                    let carrosselCard = "📸 *" + (mediaData.title || "Fotos do Pinterest") + "*\n";
                    carrosselCard += [mediaData.author, total + " fotos"].filter(Boolean).join(" · ") + "\n";
                    if (mediaData.url) carrosselCard += mediaData.url + "\n";

                    for (let i = 0; i < total; i++) {
                        const imgUrl = mediaData.images[i];
                        try {
                            const imgRes = await fetch(imgUrl);
                            const imgBuf = Buffer.from(await imgRes.arrayBuffer());
                            await client.sendMessage(from, {
                                image: imgBuf,
                                caption: i === 0 ? carrosselCard.trim() : (i + 1) + "/" + total + (mediaData.title ? " · " + mediaData.title : "")
                            }, { quoted: info });
                        } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:130: ${errIgnorado.message}`) }
                    }
                    return;
                }

                let finalFilePath = mediaData.filePath;
                if (mediaData.isVideo) {
                    const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");
                    finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
                }

                // No Pinterest o arquivo baixado JÁ é o que vai ser enviado (foto,
                // vídeo ou áudio), então a ficha vale para os três casos.
                const caption = formatMediaCaption({
                    filePath: finalFilePath,
                    elapsedMs: calcularTempoComando(info, inicioDownload),
                    platform: "Pinterest",
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    uploadDate: mediaData.uploadDate,
                    year: mediaData.year,
                    isAudio: isMp3,
                    isImage: !mediaData.isVideo && !isMp3
                });

                try {
                    if (mediaData.isVideo) {
                        const cleanTitle = (mediaData.title || "pinterest").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                        await enviarVideo({
                            client, from, filePath: finalFilePath, caption, info,
                            fileName: `${cleanTitle}.mp4`,
                            preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                        });
                    } else if (mediaData.isAudio) {
                        await enviarAudio({
                            client, from, info, caption,
                            filePath: finalFilePath,
                            fileName: mediaData.title.slice(0, 30) + ".mp3",
                            thumbnail: mediaData.thumbnail, videoPath: mediaData.filePath, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                            preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                        });
                    } else {
                        // Foto com a ficha na legenda (2026-10-15: voltou a pedido do dono).
                    await client.sendMessage(from, { image: { url: finalFilePath }, caption }, { quoted: info });
                    await require("../../services/media/avisoDownload").reagir(client, from, info, "✅");
                    }
                } finally {
                    try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:177: ${errIgnorado.message}`) }
                    try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:178: ${errIgnorado.message}`) }
                }
                return logger.info("[MEDIA HUB] Pinterest enviado para " + sender);
            } catch (err) {
                logger.error("[MEDIA HUB PINTEREST ERROR] " + cleanQuery, err);
                return reply(falaDeErro(err, { alvo: cleanQuery }));
            }
        }

        // 3. KWAI NATIVO
        if (isKwai) {
            // Aviso em texto, em paralelo com o download. Sem miniatura: a única
            // imagem da conversa tem de ser a própria mídia.
            const aviso = avisarDownload({ client, from, info, reply, url: cleanQuery, isAudio: isMp3, plataforma: "Kwai", textoSimples: isMp3 ? "⏳ Baixando o áudio do Kwai…" : "⏳ Baixando o vídeo do Kwai…", userJid: sender });
            try {
                const mediaData = await mediaQueue.enqueue({
                    url: cleanQuery,
                    format: isMp3 ? "mp3" : "mp4",
                    user: sender,
                    runFn: () => downloadKwaiVideo(cleanQuery)
                });
                await aviso;

                let finalFilePath = mediaData.filePath;
                if (!isMp3) {
                    const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");
                    finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
                }

                const caption = isMp3 ? '' : formatMediaCaption({
                    filePath: finalFilePath,
                    elapsedMs: calcularTempoComando(info, inicioDownload),
                    platform: "Kwai",
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    uploadDate: mediaData.uploadDate,
                    year: mediaData.year,
                    isAudio: isMp3
                });

                if (isMp3) {
                    const { extrairAudioMp3 } = require("../../services/media/mediaProcessor");
                    const mp3Out = await extrairAudioMp3(mediaData.filePath, null, {
                        thumbnail: mediaData.thumbnail,
                        title: mediaData.title,
                        author: mediaData.author,
                        year: mediaData.year
                    });

                    try {
                        // Ficha medida no arquivo REALMENTE enviado (o mp3), não no mp4 de origem.
                        await enviarAudio({
                            client, from, info,
                            filePath: mp3Out,
                            fileName: (mediaData.title || "kwai").slice(0, 30) + ".mp3",
                            caption: formatMediaCaption({
                                filePath: mp3Out, elapsedMs: calcularTempoComando(info, inicioDownload), platform: mediaData.platform || "Kwai",
                                title: mediaData.title, author: mediaData.author, durationFormatted: mediaData.durationFormatted,
                                url: mediaData.url, uploadDate: mediaData.uploadDate, year: mediaData.year, isAudio: true
                            }),
                            thumbnail: mediaData.thumbnail, videoPath: mediaData.filePath, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                            preferirPartes: /(^|s)-?partes?(s|$)/i.test(String(text || ''))
                        });
                    } finally {
                        try { fs.unlinkSync(mp3Out); } catch (err) { logger.warn("[MEDIA HUB KWAI] não apaguei " + mp3Out + ": " + err.message); }
                    }
                } else {
                    const cleanTitle = (mediaData.title || "kwai").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                    await enviarVideo({
                        client, from, filePath: finalFilePath, caption, info,
                        fileName: `${cleanTitle}.mp4`,
                        preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                    });
                }

                try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:255: ${errIgnorado.message}`) }
                try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:256: ${errIgnorado.message}`) }
                return logger.info("[MEDIA HUB] Kwai enviado para " + sender);
            } catch (err) {
                logger.error("[MEDIA HUB KWAI ERROR] " + cleanQuery, err);
                return reply(falaDeErro(err, { alvo: cleanQuery }));
            }
        }

        // 4. TIKTOK NATIVO
        if (isTikTok) {
            // Aviso em texto, em paralelo com o download. Sem miniatura: a única
            // imagem da conversa tem de ser a própria mídia.
            const aviso = avisarDownload({ client, from, info, reply, url: cleanQuery, isAudio: isMp3, plataforma: "TikTok", textoSimples: isMp3 ? "⏳ Baixando o áudio do TikTok…" : "⏳ Baixando o vídeo do TikTok…", userJid: sender });
            try {
                const mediaData = await mediaQueue.enqueue({
                    url: cleanQuery,
                    format: isMp3 ? "mp3" : "mp4",
                    user: sender,
                    runFn: () => downloadTikTokVideo(cleanQuery)
                });
                await aviso;

                let finalFilePath = mediaData.filePath;
                if (!isMp3) {
                    const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");
                    finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
                }

                const caption = isMp3 ? '' : formatMediaCaption({
                    filePath: finalFilePath,
                    elapsedMs: calcularTempoComando(info, inicioDownload),
                    platform: "TikTok",
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    uploadDate: mediaData.uploadDate,
                    year: mediaData.year,
                    isAudio: isMp3
                });

                if (isMp3) {
                    const { extrairAudioMp3 } = require("../../services/media/mediaProcessor");
                    const mp3Out = await extrairAudioMp3(mediaData.filePath, null, {
                        thumbnail: mediaData.thumbnail,
                        title: mediaData.title,
                        author: mediaData.author,
                        year: mediaData.year
                    });

                    try {
                        // Ficha medida no arquivo REALMENTE enviado (o mp3), não no mp4 de origem.
                        await enviarAudio({
                            client, from, info,
                            filePath: mp3Out,
                            fileName: (mediaData.title || "tiktok").slice(0, 30) + ".mp3",
                            caption: formatMediaCaption({
                                filePath: mp3Out, elapsedMs: calcularTempoComando(info, inicioDownload), platform: mediaData.platform || "TikTok",
                                title: mediaData.title, author: mediaData.author, durationFormatted: mediaData.durationFormatted,
                                url: mediaData.url, uploadDate: mediaData.uploadDate, year: mediaData.year, isAudio: true
                            }),
                            thumbnail: mediaData.thumbnail, videoPath: mediaData.filePath, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                            preferirPartes: /(^|s)-?partes?(s|$)/i.test(String(text || ''))
                        });
                    } finally {
                        try { fs.unlinkSync(mp3Out); } catch (err) { logger.warn("[MEDIA HUB TIKTOK] não apaguei " + mp3Out + ": " + err.message); }
                    }
                } else {
                    const cleanTitle = (mediaData.title || "tiktok").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                    await enviarVideo({
                        client, from, filePath: finalFilePath, caption, info,
                        fileName: `${cleanTitle}.mp4`,
                        preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                    });
                }

                if (client && from && info?.key) {
                    try { await client.sendMessage(from, { react: { text: '✅', key: info.key } }); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:334: ${errIgnorado.message}`) }
                }

                try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:337: ${errIgnorado.message}`) }
                try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:338: ${errIgnorado.message}`) }
                return logger.info("[MEDIA HUB] TikTok enviado para " + sender);
            } catch (err) {
                logger.error("[MEDIA HUB TIKTOK ERROR] " + cleanQuery, err);
                if (client && from && info?.key) {
                    try { await client.sendMessage(from, { react: { text: '❌', key: info.key } }); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:343: ${errIgnorado.message}`) }
                }
                return reply(falaDeErro(err, { alvo: cleanQuery }));
            }
        }

        // 5. TWITTER / X NATIVO
        if (isTwitter) {
            // Aviso em texto, em paralelo com o download. Sem miniatura: a única
            // imagem da conversa tem de ser a própria mídia.
            const aviso = avisarDownload({ client, from, info, reply, url: cleanQuery, isAudio: isMp3, plataforma: "Twitter/X", textoSimples: isMp3 ? "⏳ Baixando o áudio do Twitter/X…" : "⏳ Baixando o vídeo do Twitter/X…", userJid: sender });
            try {
                const mediaData = await mediaQueue.enqueue({
                    url: cleanQuery,
                    format: isMp3 ? "mp3" : "mp4",
                    user: sender,
                    runFn: () => downloadTwitterVideo(cleanQuery)
                });
                await aviso;

                let finalFilePath = mediaData.filePath;
                if (!isMp3) {
                    const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");
                    finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
                }

                const caption = isMp3 ? '' : formatMediaCaption({
                    filePath: finalFilePath,
                    elapsedMs: calcularTempoComando(info, inicioDownload),
                    platform: "Twitter (X)",
                    title: mediaData.title,
                    author: mediaData.author,
                    durationFormatted: mediaData.durationFormatted,
                    url: mediaData.url,
                    uploadDate: mediaData.uploadDate,
                    year: mediaData.year,
                    isAudio: isMp3
                });

                if (isMp3) {
                    const { extrairAudioMp3 } = require("../../services/media/mediaProcessor");
                    const mp3Out = await extrairAudioMp3(mediaData.filePath, null, {
                        thumbnail: mediaData.thumbnail,
                        title: mediaData.title,
                        author: mediaData.author,
                        year: mediaData.year
                    });

                    try {
                        // Ficha medida no arquivo REALMENTE enviado (o mp3), não no mp4 de origem.
                        await enviarAudio({
                            client, from, info,
                            filePath: mp3Out,
                            fileName: (mediaData.title || "twitterx").slice(0, 30) + ".mp3",
                            caption: formatMediaCaption({
                                filePath: mp3Out, elapsedMs: calcularTempoComando(info, inicioDownload), platform: mediaData.platform || "Twitter (X)",
                                title: mediaData.title, author: mediaData.author, durationFormatted: mediaData.durationFormatted,
                                url: mediaData.url, uploadDate: mediaData.uploadDate, year: mediaData.year, isAudio: true
                            }),
                            thumbnail: mediaData.thumbnail, videoPath: mediaData.filePath, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                            preferirPartes: /(^|s)-?partes?(s|$)/i.test(String(text || ''))
                        });
                    } finally {
                        try { fs.unlinkSync(mp3Out); } catch (err) { logger.warn("[MEDIA HUB TWITTER] não apaguei " + mp3Out + ": " + err.message); }
                    }
                } else {
                    const cleanTitle = (mediaData.title || "twitter").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                    await enviarVideo({
                        client, from, filePath: finalFilePath, caption, info,
                        fileName: `${cleanTitle}.mp4`,
                        preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                    });
                }

                try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:417: ${errIgnorado.message}`) }
                try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:418: ${errIgnorado.message}`) }
                return logger.info("[MEDIA HUB] Twitter enviado para " + sender);
            } catch (err) {
                logger.error("[MEDIA HUB TWITTER ERROR] " + cleanQuery, err);
                return reply(falaDeErro(err, { alvo: cleanQuery }));
            }
        }

        // 5. INSTAGRAM NATIVO (REELS, POSTS, CARROSSEL E ÁUDIO)
        if (isInstagram) {
            // O aviso de "baixando" sai do próprio .insta — repetir aqui duplicava a mensagem.
            try {
                const instaCmd = require("./insta");
                if (instaCmd && typeof instaCmd.execute === "function") {
                    return await instaCmd.execute({
                        sender,
                        text: (isMp4 ? "mp4 " : "mp3 ") + (cleanUrl || cleanQuery),
                        reply,
                        client,
                        from,
                        info,
                        quotedText
                    });
                }
            } catch (instaErr) {
                logger.error("[MEDIA HUB INSTAGRAM ERROR] " + cleanQuery, instaErr);
                return reply(falaDeErro(instaErr, { alvo: cleanQuery }));
            }
        }

        // 6. VÍDEO (MP4) GERAL — YOUTUBE, FACEBOOK, REDDIT, VÍDEO WEB
        const isForceAudio = isMp3 || ['spotify', 'soundcloud', 'deezer', 'applemusic', 'youtubemusic', 'bandcamp', 'mixcloud', 'audiomack'].includes(link.chave);
        const shouldDownloadVideo = (!isForceAudio) && (isMp4 || looksLikeUrl(cleanQuery));

        if (shouldDownloadVideo) {
            const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");

            // Qualquer site: o nome sai do host do link (plataformas.js).
            const msgVideo = looksLikeUrl(cleanQuery)
                ? "⏳ Baixando o vídeo do " + platformName + "…"
                : "⏳ Buscando *" + cleanQuery.slice(0, 60) + "*…";
            // Busca por nome avisa já; link avisa com título e duração quando os dados chegam.
            if (!looksLikeUrl(cleanQuery)) await reply(msgVideo);

            let alvoVideo = cleanQuery;
            try {
                const meta = await extractMetadata(cleanQuery, { isSearch: !looksLikeUrl(cleanQuery), userJid: sender });
                if (meta.title) alvoVideo = meta.title;
                const targetUrl = meta.webpageUrl || meta.url || cleanQuery;
                await avisarDownload({ client, from, info, reply, meta, url: targetUrl, tipo: link.tipo === 'imagem' ? 'imagem ou vídeo' : 'vídeo', plataforma: platformName, textoSimples: msgVideo, userJid: sender });

                const downloaded = await mediaQueue.enqueue({
                    url: targetUrl,
                    format: "mp4",
                    user: sender,
                    duration: meta.duration,
                    runFn: () => downloadMedia({
                        source: targetUrl,
                        url: targetUrl,
                        requestedFormat: "mp4",
                        format: "mp4",
                        duration: meta.duration,
                        metadata: meta,
                        userJid: sender
                    })
                });

                let filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0]);
                if (filePath && fs.existsSync(filePath)) {
                    filePath = await ensureMobileVideoCompatibility(filePath);
                    const stats = fs.statSync(filePath);
                    const sizeMb = require("../../utils/tamanho").formatarTamanho(stats.size);
                    const cleanTitle = (meta.title || "video").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);

                    const caption = formatMediaCaption({
                        filePath: filePath,
                        elapsedMs: calcularTempoComando(info, inicioDownload),
                        platform: platformName,
                        title: meta.title,
                        author: meta.author,
                        durationFormatted: meta.durationFormatted,
                        url: targetUrl,
                        uploadDate: meta.uploadDate || meta.upload_date,
                        year: meta.year || meta.release_year,
                        isAudio: false
                    });

                    try {
                        // Entrega na galeria sempre que possível; comprime se não couber,
                        // e só vira documento em último caso (ou com a flag -doc).
                        await enviarVideo({
                            client, from, filePath, caption, info,
                            fileName: `${cleanTitle}.mp4`,
                            preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                        })
                        if (client && from && info?.key) {
                            try { await client.sendMessage(from, { react: { text: '✅', key: info.key } }); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:514: ${errIgnorado.message}`) }
                        }
                        logger.info("[MEDIA HUB] Vídeo (" + sizeMb + ") enviado para " + sender + ": " + meta.title);
                    } finally {
                        try { fs.unlinkSync(filePath); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:518: ${errIgnorado.message}`) }
                    }
                    return;
                }
            } catch (videoErr) {
                logger.error("[MEDIA HUB VIDEO ERROR] " + cleanQuery, videoErr);
                if (client && from && info?.key) {
                    try { await client.sendMessage(from, { react: { text: '❌', key: info.key } }); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:525: ${errIgnorado.message}`) }
                }
                return reply(falaDeErro(videoErr, { alvo: alvoVideo }));
            }
        }

        // 7. ÁUDIO MP3 DE ALTA FIDELIDADE
        // Link: aviso com plataforma e tipo. Nome: a busca avisa na hora.
        if (looksLikeUrl(cleanQuery)) {
            await avisarDownload({ client, from, info, reply, url: cleanQuery, isAudio: true, tipo: 'áudio', plataforma: platformName, textoSimples: "⏳ Baixando o áudio do " + platformName + "…", userJid: sender });
        } else {
            await require('../../services/media/avisoDownload').avisarBusca({ client, from, info, reply, tipo: 'áudio' })
        }

        try {
            const mediaData = await mediaQueue.enqueue({
                url: cleanQuery,
                format: "mp3",
                user: sender,
                runFn: () => searchAndDownloadAudio(cleanQuery)
            });

            const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                elapsedMs: calcularTempoComando(info, inicioDownload),
                platform: mediaData.platform || platformName,
                title: mediaData.title,
                author: mediaData.author,
                durationFormatted: mediaData.durationFormatted,
                url: mediaData.url,
                uploadDate: mediaData.uploadDate || mediaData.upload_date,
                year: mediaData.year || mediaData.release_year,
                audioBitrate: "320 kbps",
                isAudio: true
            });

            if (fs.existsSync(mediaData.filePath)) {
                const cleanTitle = (mediaData.title || "audio").replace(/[\\/:*?"<>|]/g, "_").slice(0, 40);
                try {
                    // A capa vai anexada ao próprio áudio; não existe mais a foto
                    // solta que aparecia antes dele.
                    await enviarAudio({
                        client, from, info, caption,
                        filePath: mediaData.filePath,
                        fileName: `${cleanTitle}.mp3`,
                        thumbnail: mediaData.thumbnail, videoPath: mediaData.filePath, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                    if (client && from && info?.key) {
                        try { await client.sendMessage(from, { react: { text: '✅', key: info.key } }); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:574: ${errIgnorado.message}`) }
                    }
                } finally {
                    try { fs.unlinkSync(mediaData.filePath); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:577: ${errIgnorado.message}`) }
                }
            }

            logger.info("[MEDIA HUB] Áudio enviado para " + sender);
        } catch (err) {
            logger.error("[MEDIA HUB ERROR] áudio " + cleanQuery, err);
            if (client && from && info?.key) {
                try { await client.sendMessage(from, { react: { text: '❌', key: info.key } }); } catch (errIgnorado) { logger.warn(`[MEDIA] Falha ignorada em src/commands/media/media.js:585: ${errIgnorado.message}`) }
            }
            await reply(falaDeErro(err, { alvo: cleanQuery }));
        }
    }
};
