/**
 * Comando .kwai
 * Download de vídeos e carrosséis do Kwai em alta resolução
 */

const { avisarDownload } = require('../../services/media/avisoDownload')
const fs = require('fs');
const { downloadKwaiVideo } = require('../../services/media/providers/kwai');
const { formatMediaCaption } = require('../../services/media/formatResolver');
const { mediaQueue } = require('../../services/mediaQueue');
const { extractUrlAndFormat } = require('../../services/media/urlExtractor');
const logger = require('../../core/logger');
const { enviarAudio } = require('../../services/media/audioSender');
const { falaDeErro } = require('../../services/media/mediaErrors');

module.exports = {
    name: 'kwai',
    aliases: ['kwaivideo', 'kwaidl', 'kwaidownload'],
    category: 'media',
    description: 'Baixa vídeos e fotos do Kwai em alta resolução',
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info, quotedText }) => {
        const inicioDownload = Date.now();
        const rawInput = (text || quotedText || '').trim();
        const { url: cleanUrl, isMp3 } = extractUrlAndFormat(rawInput);

        if (!cleanUrl) {
            return reply('❌ Faltou o link do Kwai.\n• `.kwai <link>` — mando o vídeo\n• `.kwai mp3 <link>` — mando só o áudio');
        }

        // Aviso em texto, em paralelo com o download. Sem miniatura: a única
        // imagem da conversa tem de ser a própria mídia.
        const aviso = avisarDownload({ client, from, info, reply, url: cleanUrl, isAudio: isMp3, plataforma: 'Kwai', textoSimples: isMp3 ? '⏳ Baixando o áudio do Kwai…' : '⏳ Baixando do Kwai…', userJid: sender });

        try {
            const mediaData = await mediaQueue.enqueue({
                url: cleanUrl,
                format: isMp3 ? 'mp3' : 'mp4',
                user: sender,
                runFn: () => downloadKwaiVideo(cleanUrl)
            });
            await aviso;

            // 1. CARROSSEL DE FOTOS DO KWAI
            if (mediaData.images && Array.isArray(mediaData.images) && mediaData.images.length > 1) {
                const total = mediaData.images.length;
                let carrosselCard = "📸 *" + (mediaData.title || "Fotos do Kwai") + "*\n";
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
                    } catch (errIgnorado) { logger.warn(`[KWAI] Falha ignorada em src/commands/media/kwai.js:62: ${errIgnorado.message}`) }
                }
                return;
            }

            const { ensureMobileVideoCompatibility } = require('../../services/media/mediaProcessor');
            const { enviarVideo } = require('../../services/media/videoSender');

            let finalFilePath = mediaData.filePath;
            if (!isMp3) {
                finalFilePath = await ensureMobileVideoCompatibility(mediaData.filePath);
            }

            const { calcularTempoComando } = require('../../services/media/formatResolver');
            const tempoDecorrido = calcularTempoComando(info, inicioDownload);
            const caption = isMp3 ? '' : formatMediaCaption({
                filePath: finalFilePath,
                elapsedMs: tempoDecorrido,
                platform: 'Kwai',
                title: mediaData.title,
                author: mediaData.author,
                durationFormatted: mediaData.durationFormatted,
                url: mediaData.url,
                uploadDate: mediaData.uploadDate,
                year: mediaData.year,
                isAudio: isMp3
            });

            if (isMp3) {
                const { extrairAudioMp3 } = require('../../services/media/mediaProcessor');
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
                        fileName: (mediaData.title || "audio").slice(0, 30) + ".mp3",
                        caption: formatMediaCaption({
                            filePath: mp3Out, elapsedMs: tempoDecorrido, platform: mediaData.platform || 'Kwai',
                            title: mediaData.title, author: mediaData.author, durationFormatted: mediaData.durationFormatted,
                            url: mediaData.url, uploadDate: mediaData.uploadDate, year: mediaData.year, isAudio: true
                        }),
                        thumbnail: mediaData.thumbnail, videoPath: mediaData.filePath, title: mediaData.title, author: mediaData.author, url: mediaData.url,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                } finally {
                    try { fs.unlinkSync(mp3Out); } catch (err) { logger.warn(`[KWAI] não apaguei ${mp3Out}: ${err.message}`); }
                }
            } else {
                const cleanTitle = (mediaData.title || "kwai").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                await enviarVideo({
                    client, from, filePath: finalFilePath, caption, info,
                    fileName: `${cleanTitle}.mp4`,
                    preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                });
            }

            try { if (mediaData.filePath && fs.existsSync(mediaData.filePath)) fs.unlinkSync(mediaData.filePath); } catch (errIgnorado) { logger.warn(`[KWAI] Falha ignorada em src/commands/media/kwai.js:123: ${errIgnorado.message}`) }
            try { if (finalFilePath && finalFilePath !== mediaData.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (errIgnorado) { logger.warn(`[KWAI] Falha ignorada em src/commands/media/kwai.js:124: ${errIgnorado.message}`) }
            logger.info("[KWAI] Mídia enviada para " + sender);
        } catch (err) {
            logger.error('[KWAI ERROR] ' + cleanUrl, err);
            return reply(falaDeErro(err, { alvo: cleanUrl }));
        }
    }
};
