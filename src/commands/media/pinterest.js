/**
 * Comando .pinterest
 * Download de imagens em alta resolução, vídeos MP4 e extração de áudio MP3 do Pinterest
 */

const fs = require("fs");
const { downloadPinterestMedia } = require("../../services/pinterestService");
const { formatMediaCaption, calcularTempoComando } = require("../../services/media/formatResolver");
const { mediaQueue } = require("../../services/mediaQueue");
const { extractUrlAndFormat } = require("../../services/media/urlExtractor");
const logger = require("../../core/logger");
const { enviarAudio } = require('../../services/media/audioSender');
const { falaDeErro } = require('../../services/media/mediaErrors');

module.exports = {
    name: "pinterest",
    aliases: ["pin", "pindl", "pint", "pinterestvideo", "pinterestfoto"],
    category: "media",
    description: "Baixa imagens originais, vídeos na melhor qualidade e áudio MP3 do Pinterest",
    cooldownMs: 3000,
    execute: async ({ text, quotedText, from, info, client, reply, sender }) => {
        const inicioDownload = Date.now();
        const rawInput = (text || quotedText || "").trim();
        if (!rawInput) {
            let doc = "📌 *Como baixar do Pinterest*\n";
            doc += "• \`.pinterest <link>\` — mando a imagem ou o vídeo\n";
            doc += "• \`.pinterest mp3 <link>\` — mando só o áudio do vídeo\n";
            doc += "• \`.pinterest <pesquisa>\` — busco imagens, ex.: \`.pinterest GOAT wallpaper\`";
            return reply(doc);
        }

        const { url: cleanUrl, isMp3, cleanQuery } = extractUrlAndFormat(rawInput);
        const target = cleanUrl || cleanQuery;

        // Link: aviso com plataforma e tipo. Pesquisa: avisa que está buscando.
        if (cleanUrl) await require('../../services/media/avisoDownload').avisarDownload({ client, from, info, reply, url: cleanUrl, isAudio: isMp3, tipo: isMp3 ? "áudio" : "imagem ou vídeo", plataforma: "Pinterest", textoSimples: "⏳ Baixando do Pinterest…", userJid: sender });
        else await require('../../services/media/avisoDownload').avisarBusca({ client, from, info, reply, tipo: 'imagem ou vídeo', plataforma: "Pinterest" })

        try {
            const mediaData = await mediaQueue.enqueue({
                url: target,
                format: isMp3 ? "mp3" : "mp4",
                user: sender,
                runFn: () => downloadPinterestMedia(target, { format: isMp3 ? "mp3" : "mp4" })
            });

            // CARROSSEL DO PINTEREST
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
                    } catch (errIgnorado) { logger.warn(`[PINTEREST] Falha ignorada em src/commands/media/pinterest.js:65: ${errIgnorado.message}`) }
                }
                return;
            }

            const { ensureMobileVideoCompatibility } = require('../../services/media/mediaProcessor');
            const { enviarVideo } = require('../../services/media/videoSender');

            let finalFilePath = mediaData.filePath;
            if (mediaData.isVideo) {
                finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
            }

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
                    // A capa vai anexada ao áudio, não como foto antes dele.
                    await enviarAudio({
                        client, from, info, caption,
                        filePath: finalFilePath,
                        fileName: (mediaData.title || "audio").slice(0, 30) + ".mp3",
                        thumbnail: mediaData.thumbnail, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                } else {
                    // Foto com a ficha na legenda (2026-10-15: voltou a pedido do dono).
                    await client.sendMessage(from, { image: { url: finalFilePath }, caption }, { quoted: info });
                    await require("../../services/media/avisoDownload").reagir(client, from, info, "✅");
                }
                logger.info("[PINTEREST] Mídia enviada para " + sender + ": " + mediaData.title);
            } finally {
                try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (errIgnorado) { logger.warn(`[PINTEREST] Falha ignorada em src/commands/media/pinterest.js:114: ${errIgnorado.message}`) }
                try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (errIgnorado) { logger.warn(`[PINTEREST] Falha ignorada em src/commands/media/pinterest.js:115: ${errIgnorado.message}`) }
            }
        } catch (err) {
            logger.error("[PINTEREST ERROR] " + target, err);
            return reply(falaDeErro(err, { alvo: target, acao: cleanUrl ? "baixar" : "buscar" }));
        }
    }
};
