/**
 * Comando .gif / .toimg / .tovideo
 * Converte figurinhas (estáticas ou animadas) de volta para Imagem ou Vídeo/GIF, e mídias em figurinhas
 */

const { downloadWhatsAppMedia, converterFigurinhaParaMidia, criarFigurinha } = require('../../services/mediaService');
const { getBotName } = require('../../config/botConfig');
const logger = require('../../core/logger');

module.exports = {
    name: 'gif',
    aliases: [ 'tovideo', 'togif', 'desfig', 'desfazerfigurinha'],
    category: 'media',
    description: 'Converte figurinhas em imagem (estática) ou vídeo/GIF (animada), e mídias em figurinhas',
    cooldownMs: 2000,
    execute: async ({ info, type, from, client, reply }) => {
        const botName = getBotName();
        const contextInfo = info.message?.extendedTextMessage?.contextInfo;
        const quoted = contextInfo?.quotedMessage;

        const isSticker = type === 'stickerMessage';
        const isQuotedSticker = !!quoted?.stickerMessage;
        const isImage = type === 'imageMessage';
        const isQuotedImage = !!quoted?.imageMessage;
        const isVideo = type === 'videoMessage';
        const isQuotedVideo = !!quoted?.videoMessage;

        if (!isSticker && !isQuotedSticker && !isImage && !isQuotedImage && !isVideo && !isQuotedVideo) {
            return reply('❌ Responda a uma figurinha com `.gif` para virar GIF ou imagem — ou a uma foto/vídeo para virar figurinha.');
        }

        try {
            // CASO 1: CONVERTER FIGURINHA EM MÍDIA (VÍDEO MP4 / IMAGEM PNG)
            if (isSticker || isQuotedSticker) {
                await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

                // Passa o objeto completo ou o nó de figurinha para o download resiliente
                const targetWrapper = isSticker ? info : {
                    key: {
                        remoteJid: from,
                        id: contextInfo?.stanzaId,
                        participant: contextInfo?.participant
                    },
                    message: quoted
                };

                const isStickerAnimatedHint = Boolean(
                    info.message?.stickerMessage?.isAnimated ||
                    quoted?.stickerMessage?.isAnimated ||
                    contextInfo?.quotedMessage?.stickerMessage?.isAnimated
                );

                const buffer = await downloadWhatsAppMedia(targetWrapper, 'sticker', client);
                const converted = await converterFigurinhaParaMidia(buffer, isStickerAnimatedHint);

                if (converted.type === 'video') {
                    await client.sendMessage(from, {
                        video: converted.buffer,
                        gifPlayback: true,
                        caption: '🎬 Figurinha animada virou GIF.'
                    }, { quoted: info });
                } else {
                    await client.sendMessage(from, {
                        image: converted.buffer,
                        caption: '🖼️ Figurinha virou imagem.'
                    }, { quoted: info });
                }

                return logger.info(`[GIF COMMAND] Figurinha convertida com sucesso (${converted.type}) em ${from}`);
            }

            // CASO 2: CONVERTER VÍDEO OU IMAGEM EM FIGURINHA
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')
            const isAnimated = isVideo || isQuotedVideo;

            const targetWrapper = (isImage || isVideo) ? info : {
                key: {
                    remoteJid: from,
                    id: contextInfo?.stanzaId,
                    participant: contextInfo?.participant
                },
                message: quoted
            };

            const buffer = await downloadWhatsAppMedia(targetWrapper, isAnimated ? 'video' : 'image', client);
            const stickerBuffer = await criarFigurinha(buffer, isAnimated, botName, 'GIF & Mídia');

            await client.sendMessage(from, {
                sticker: stickerBuffer
            }, { quoted: info });

            logger.info(`[GIF COMMAND] Mídia convertida em figurinha (${isAnimated ? 'animada' : 'estática'}) em ${from}`);
        } catch (err) {
            logger.error(`[GIF COMMAND ERROR] em ${from}:`, err);
            await reply('❌ Não consegui converter isso. Tente com outra figurinha ou mídia.');
        }
    }
};
