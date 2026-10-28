/**
 * Comando .insta
 * Download direto de Reels, Posts e Carrosséis do Instagram
 */

const { avisarDownload } = require('../../services/media/avisoDownload')
const fs = require('fs');
const { extractMetadata, downloadMedia } = require('../../services/mediaEngine');
const { mediaQueue } = require('../../services/mediaQueue');
const { extractUrlAndFormat } = require('../../services/media/urlExtractor');
const { formatMediaCaption, calcularTempoComando } = require('../../services/media/formatResolver');
const logger = require('../../core/logger');
const { enviarAudio } = require('../../services/media/audioSender');
const { falaDeErro } = require('../../services/media/mediaErrors');

module.exports = {
    name: 'insta',
    aliases: ['instagram', 'ig', 'reels', 'instadl'],
    category: 'media',
    description: 'Baixa vídeos de Reels, Posts e Carrosséis do Instagram',
    cooldownMs: 5000,
    execute: async ({ sender, text, reply, client, from, info, quotedText }) => {
        const inicioDownload = Date.now();
        const rawInput = (text || quotedText || '').trim();
        const { url: queryUrl, isMp3 } = extractUrlAndFormat(rawInput);

        if (!queryUrl || !require('../../services/media/plataformas').ehPlataforma(queryUrl, 'instagram')) {
            return reply('❌ Faltou o link do Instagram.\n• `.insta <link>` — mando o vídeo (ou as fotos)\n• `.insta mp3 <link>` — mando só o áudio');
        }


        try {
            const meta = await extractMetadata(queryUrl);
            await avisarDownload({ client, from, info, reply, meta, url: meta.webpageUrl, isAudio: isMp3, tipo: isMp3 ? 'áudio' : 'vídeo', plataforma: 'Instagram', textoSimples: '⏳ Baixando do Instagram…', userJid: sender });

            const downloaded = await mediaQueue.enqueue({
                url: meta.webpageUrl,
                format: isMp3 ? 'mp3' : 'mp4',
                user: sender,
                runFn: () => downloadMedia({
                    url: meta.webpageUrl,
                    source: meta.webpageUrl,
                    format: isMp3 ? 'mp3' : 'mp4',
                    requestedFormat: isMp3 ? 'mp3' : 'mp4',
                    requestedQuality: 'best'
                })
            });

            // CARROSSEL DE MÍDIAS DO INSTAGRAM
            if (downloaded.images && Array.isArray(downloaded.images) && downloaded.images.length > 1) {
                const total = downloaded.images.length;
                let carrosselCard = "📸 *" + (meta.title || "Post do Instagram") + "*\n";
                carrosselCard += [meta.author, total + " itens"].filter(Boolean).join(" · ") + "\n";
                if (meta.webpageUrl) carrosselCard += meta.webpageUrl + "\n";

                for (let i = 0; i < total; i++) {
                    const imgUrl = downloaded.images[i];
                    try {
                        const imgRes = await fetch(imgUrl);
                        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
                        await client.sendMessage(from, {
                            image: imgBuf,
                            caption: i === 0 ? carrosselCard.trim() : (i + 1) + "/" + total + (meta.title ? " · " + meta.title.slice(0, 45) : "")
                        }, { quoted: info });
                    } catch (errIgnorado) { logger.warn(`[INSTA] Falha ignorada em src/commands/media/insta.js:68: ${errIgnorado.message}`) }
                }
                return;
            }

            const { ensureMobileVideoCompatibility } = require('../../services/media/mediaProcessor');
            const { enviarVideo } = require('../../services/media/videoSender');

            let finalFilePath = downloaded.filePath;
            if (!isMp3) {
                finalFilePath = await ensureMobileVideoCompatibility(downloaded.filePath);
            }

            const caption = formatMediaCaption({
                filePath: finalFilePath,
                elapsedMs: calcularTempoComando(info, inicioDownload),
                platform: 'Instagram',
                title: meta.title,
                author: meta.author,
                durationFormatted: meta.durationFormatted,
                url: meta.webpageUrl,
                uploadDate: meta.uploadDate,
                year: meta.year,
                isAudio: isMp3
            });

            try {
                if (isMp3) {
                    // A ficha vai em texto e a capa do post viaja anexada ao próprio
                    // áudio — nada de mandar a foto e o áudio como duas mídias.
                    await enviarAudio({
                        client, from, info, caption,
                        filePath: finalFilePath,
                        fileName: (meta.title || "instagram").slice(0, 30) + ".mp3",
                        thumbnail: meta.thumbnail, title: meta.title, author: meta.author, url: meta.webpageUrl,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                } else {
                    const cleanTitle = (meta.title || "instagram").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                    await enviarVideo({
                        client, from, filePath: finalFilePath, caption, info,
                        fileName: `${cleanTitle}.mp4`,
                        preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                    });
                }
                logger.info("[INSTA] Mídia enviada para " + sender);
            } finally {
                try { if (downloaded.filePath && fs.existsSync(downloaded.filePath)) fs.unlinkSync(downloaded.filePath); } catch (errIgnorado) { logger.warn(`[INSTA] Falha ignorada em src/commands/media/insta.js:115: ${errIgnorado.message}`) }
                try { if (finalFilePath && finalFilePath !== downloaded.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (errIgnorado) { logger.warn(`[INSTA] Falha ignorada em src/commands/media/insta.js:116: ${errIgnorado.message}`) }
            }
        } catch (err) {
            logger.error('[INSTA ERROR] ' + queryUrl, err);
            await reply(falaDeErro(err, { alvo: queryUrl }));
        }
    }
};
