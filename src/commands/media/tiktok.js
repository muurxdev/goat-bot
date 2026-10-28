/**
 * Comando .tiktok
 * Download direto de vídeos e carrossel de fotos do TikTok em alta resolução sem marca d'água
 */

const { avisarDownload } = require('../../services/media/avisoDownload')
const fs = require("fs");
const { downloadTikTokVideo } = require("../../services/media/providers/tiktok");
const { formatMediaCaption } = require("../../services/media/formatResolver");
const { mediaQueue } = require("../../services/mediaQueue");
const { extractUrlAndFormat } = require("../../services/media/urlExtractor");
const logger = require("../../core/logger");
const { enviarAudio } = require('../../services/media/audioSender');
const { falaDeErro } = require('../../services/media/mediaErrors');

module.exports = {
    name: "tiktok",
    aliases: ["tk", "tt", "tiktokdl"],
    category: "media",
    description: "Baixa vídeos ou carrossel de fotos do TikTok em alta resolução através do link",
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info, quotedText }) => {
        const inicioDownload = Date.now();
        const rawInput = (text || quotedText || "").trim();
        const { url: queryUrl, isMp3 } = extractUrlAndFormat(rawInput);

        if (!queryUrl || !require('../../services/media/plataformas').ehPlataforma(queryUrl, 'tiktok')) {
            return reply("❌ Faltou o link do TikTok.\n• `.tiktok <link>` — mando o vídeo (ou as fotos)\n• `.tiktok mp3 <link>` — mando só o áudio");
        }

        if (client && from && info?.key) {
            try { await client.sendMessage(from, { react: { text: '⏳', key: info.key } }); } catch (errIgnorado) { logger.warn(`[TIKTOK] Falha ignorada em src/commands/media/tiktok.js:31: ${errIgnorado.message}`) }
        }
        // Aviso em texto, em paralelo com o download. Sem miniatura: a única
        // imagem da conversa tem de ser a própria mídia.
        const aviso = avisarDownload({ client, from, info, reply, url: queryUrl, isAudio: isMp3, plataforma: 'TikTok', textoSimples: isMp3 ? "⏳ Baixando o áudio do TikTok…" : "⏳ Baixando do TikTok…", userJid: sender });

        try {
            const mediaData = await mediaQueue.enqueue({
                url: queryUrl,
                format: isMp3 ? "mp3" : "mp4",
                user: sender,
                runFn: () => downloadTikTokVideo(queryUrl)
            });
            await aviso;

            // 1. CARROSSEL DE FOTOS / SLIDESHOW
            if (mediaData.isCarousel) {
                let card = "📸 *" + (mediaData.title || "Fotos do TikTok") + "*\n";
                card += [mediaData.author, mediaData.carouselCount + " fotos"].filter(Boolean).join(" · ") + "\n";
                if (mediaData.url) card += mediaData.url + "\n";

                for (let idx = 0; idx < mediaData.carouselItems.length; idx++) {
                    const item = mediaData.carouselItems[idx];
                    const imgBuf = fs.readFileSync(item.path);
                    await client.sendMessage(from, {
                        image: imgBuf,
                        caption: idx === 0 ? card.trim() : (idx + 1) + "/" + mediaData.carouselItems.length + (mediaData.title ? " · " + mediaData.title.slice(0, 45) : "")
                    }, { quoted: info });
                    try { fs.unlinkSync(item.path); } catch (errIgnorado) { logger.warn(`[TIKTOK] Falha ignorada em src/commands/media/tiktok.js:63: ${errIgnorado.message}`) }
                }
                if (client && from && info?.key) {
                    try { await client.sendMessage(from, { react: { text: '✅', key: info.key } }); } catch (errIgnorado) { logger.warn(`[TIKTOK] Falha ignorada em src/commands/media/tiktok.js:66: ${errIgnorado.message}`) }
                }
                return logger.info("[TIKTOK] Carrossel com " + mediaData.carouselCount + " fotos enviado para " + sender);
            }

            const { ensureMobileVideoCompatibility } = require("../../services/media/mediaProcessor");
            const { enviarVideo } = require("../../services/media/videoSender");

            let finalFilePath = mediaData.filePath;
            if (!isMp3) {
                finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
            }

            const { calcularTempoComando } = require("../../services/media/formatResolver");
            const tempoDecorrido = calcularTempoComando(info, inicioDownload);

            // 2. VÍDEO PADRÃO OU ÁUDIO MP3
            const caption = isMp3 ? '' : formatMediaCaption({
                filePath: finalFilePath,
                elapsedMs: tempoDecorrido,
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
                            filePath: mp3Out, elapsedMs: tempoDecorrido, platform: mediaData.platform || 'TikTok',
                            title: mediaData.title, author: mediaData.author, durationFormatted: mediaData.durationFormatted,
                            url: mediaData.url, uploadDate: mediaData.uploadDate, year: mediaData.year, isAudio: true
                        }),
                        thumbnail: mediaData.thumbnail, videoPath: mediaData.filePath, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                } finally {
                    try { fs.unlinkSync(mp3Out); } catch (err) { logger.warn(`[TIKTOK] não apaguei ${mp3Out}: ${err.message}`); }
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
                try { await client.sendMessage(from, { react: { text: '✅', key: info.key } }); } catch (errIgnorado) { logger.warn(`[TIKTOK] Falha ignorada em src/commands/media/tiktok.js:129: ${errIgnorado.message}`) }
            }

            try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (errIgnorado) { logger.warn(`[TIKTOK] Falha ignorada em src/commands/media/tiktok.js:132: ${errIgnorado.message}`) }
            try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (errIgnorado) { logger.warn(`[TIKTOK] Falha ignorada em src/commands/media/tiktok.js:133: ${errIgnorado.message}`) }
            logger.info("[TIKTOK] Mídia enviada com sucesso para " + sender);
        } catch (err) {
            logger.error("[TIKTOK ERROR] " + queryUrl, err);
            if (client && from && info?.key) {
                try { await client.sendMessage(from, { react: { text: '❌', key: info.key } }); } catch (errIgnorado) { logger.warn(`[TIKTOK] Falha ignorada em src/commands/media/tiktok.js:138: ${errIgnorado.message}`) }
            }
            await reply(falaDeErro(err, { alvo: queryUrl }));
        }
    }
};
