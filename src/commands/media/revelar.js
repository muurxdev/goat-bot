/**
 * Comando .revelar / .viewonce / .vo / .desocultar
 * Revela e reenvia mídias de visualização única (foto, vídeo, áudio/voz)
 * de forma permanente e sem restrições.
 */

const mediaService = require('../../services/mediaService');
const { getBotName } = require('../../config/botConfig');
const logger = require('../../core/logger');

/**
 * Desembrulha e localiza o nó de mídia e informações de visualização única
 */
function extractViewOnceMedia(info, quotedMsg) {
    const candidates = [
        quotedMsg,
        info?.message?.extendedTextMessage?.contextInfo?.quotedMessage,
        info?.message
    ];

    for (const cand of candidates) {
        if (!cand) continue;

        let m = cand;
        if (m.message) m = m.message;

        let isViewOnce = false;

        // Desembrulha envelopes conhecidos do Baileys/WhatsApp
        while (
            m?.viewOnceMessage ||
            m?.viewOnceMessageV2 ||
            m?.viewOnceMessageV2Extension ||
            m?.ephemeralMessage ||
            m?.documentWithCaptionMessage
        ) {
            if (m.viewOnceMessage || m.viewOnceMessageV2 || m.viewOnceMessageV2Extension) {
                isViewOnce = true;
            }
            m = m.viewOnceMessage?.message ||
                m.viewOnceMessageV2?.message ||
                m.viewOnceMessageV2Extension?.message ||
                m.ephemeralMessage?.message ||
                m.documentWithCaptionMessage?.message;
        }

        if (m?.imageMessage) {
            return {
                type: 'image',
                node: m.imageMessage,
                mediaType: 'image',
                isViewOnce: isViewOnce || Boolean(m.imageMessage.viewOnce),
                caption: m.imageMessage.caption || '',
                rawWrapper: { message: m }
            };
        }

        if (m?.videoMessage) {
            return {
                type: 'video',
                node: m.videoMessage,
                mediaType: 'video',
                isViewOnce: isViewOnce || Boolean(m.videoMessage.viewOnce),
                caption: m.videoMessage.caption || '',
                rawWrapper: { message: m }
            };
        }

        if (m?.audioMessage) {
            return {
                type: 'audio',
                node: m.audioMessage,
                mediaType: 'audio',
                isViewOnce: isViewOnce || Boolean(m.audioMessage.viewOnce),
                caption: m.audioMessage.caption || '',
                rawWrapper: { message: m }
            };
        }

        if (m?.documentMessage) {
            const mime = String(m.documentMessage.mimetype || '').toLowerCase();
            let dType = 'document';
            if (mime.startsWith('image/')) dType = 'image';
            else if (mime.startsWith('video/')) dType = 'video';
            else if (mime.startsWith('audio/')) dType = 'audio';

            return {
                type: dType,
                node: m.documentMessage,
                mediaType: dType === 'document' ? 'document' : dType,
                isViewOnce: isViewOnce || Boolean(m.documentMessage.viewOnce),
                caption: m.documentMessage.caption || m.documentMessage.fileName || '',
                fileName: m.documentMessage.fileName || 'arquivo_revelado',
                rawWrapper: { message: m }
            };
        }
    }

    return null;
}

module.exports = {
    name: 'revelar',
    aliases: [
        'viewonce', 'vo', 'desocultar', 'antiviewonce', 'ver', 'revelarmsg', 'abrirvo',
        'visualizacaounica', 'antivo', 'revela', 'abrirfoto', 'abrirvideo', 'abriraudio',
        'abrirvisu', 'visuunica', 'visu',
        'cmd_revelar', 'alt_revelar', 'atalho_revelar', 'abrev_revelar', 'call_revelar', 'func_revelar'
    ],
    category: 'media',
    subcategory: 'Downloads & Mídia',
    description: 'Revela e reenvia mídias de visualização única (foto, vídeo ou áudio) em formato permanente',
    usage: '[responda à foto, vídeo ou áudio de visualização única]',
    examples: [
        ' — responda a uma mensagem de visualização única com .revelar',
        'pv — reenvia a mídia revelada diretamente no seu privado'
    ],
    cooldownMs: 3000,
    execute: async ({ from, reply, client, info, quotedMsg, args = [], sender }) => {
        const botName = getBotName();
        const mediaData = extractViewOnceMedia(info, quotedMsg);

        if (!mediaData) {
            let help = `╔══════════════════════════════╗\n`;
            help += `║   🔓 *REVELAR VISUALIZAÇÃO ÚNICA* 🔓   ║\n`;
            help += `╚══════════════════════════════╝\n\n`;
            help += `📌 *Como usar:*\n`;
            help += `Responda a uma foto, vídeo ou áudio de visualização única com:\n\n`;
            help += `• \`.revelar\` ➔ Reenvia a mídia aberta aqui no chat\n`;
            help += `• \`.revelar pv\` ➔ Reenvia a mídia diretamente no seu privado\n\n`;
            help += `💡 _Compatível com fotos, vídeos e mensagens de voz de visualização única!_\n`;
            help += `👑 *${botName}*`;
            return reply(help.trim());
        }

        const isPv = (args[0] || '').toLowerCase() === 'pv' || args.includes('-pv');
        const targetChat = isPv ? sender : from;

        await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳');

        try {
            const buffer = await mediaService.downloadWhatsAppMedia(mediaData.rawWrapper, mediaData.mediaType, client);

            if (!buffer || !buffer.length) {
                await require('../../services/media/avisoDownload').reagir(client, from, info, '❌');
                return reply('❌ Não consegui baixar esta mídia. Os servidores do WhatsApp podem já ter expirado o arquivo ou ele ainda não foi baixado pelo app.');
            }

            // Identifica remetente original da mídia
            const contextInfo = info?.message?.extendedTextMessage?.contextInfo;
            const originalSender = contextInfo?.participant || sender;
            const originalNum = originalSender.split('@')[0].split(':')[0];

            let tipoLabel = 'Foto';
            if (mediaData.type === 'video') tipoLabel = 'Vídeo';
            if (mediaData.type === 'audio') tipoLabel = 'Áudio / Voz';

            let docCaption = `╔══════════════════════════════╗\n`;
            docCaption += `║   🔓 *MÍDIA REVELADA (VO)* 🔓   ║\n`;
            docCaption += `╚══════════════════════════════╝\n\n`;
            docCaption += `👤 *Enviada por:* @${originalNum}\n`;
            docCaption += `📦 *Tipo:* ${tipoLabel}\n`;
            docCaption += `✨ *Proteção de visualização única removida!*\n`;
            if (mediaData.caption && mediaData.caption.trim()) {
                docCaption += `\n📝 *Legenda original:*\n"${mediaData.caption.trim()}"\n`;
            }
            docCaption += `\n👑 *${botName}*`;

            const mentions = [originalSender];

            if (mediaData.type === 'image') {
                await client.sendMessage(targetChat, {
                    image: buffer,
                    caption: docCaption.trim(),
                    mentions
                }, { quoted: info });
            } else if (mediaData.type === 'video') {
                await client.sendMessage(targetChat, {
                    video: buffer,
                    caption: docCaption.trim(),
                    mimetype: mediaData.node?.mimetype || 'video/mp4',
                    mentions
                }, { quoted: info });
            } else if (mediaData.type === 'audio') {
                // Áudio / Mensagem de voz PTT não aceita legenda direta no WhatsApp
                await client.sendMessage(targetChat, {
                    audio: buffer,
                    mimetype: mediaData.node?.mimetype || 'audio/ogg; codecs=opus',
                    ptt: true
                }, { quoted: info });

                await client.sendMessage(targetChat, {
                    text: docCaption.trim(),
                    mentions
                });
            } else if (mediaData.type === 'document') {
                await client.sendMessage(targetChat, {
                    document: buffer,
                    mimetype: mediaData.node?.mimetype || 'application/octet-stream',
                    fileName: mediaData.fileName || 'arquivo_revelado',
                    caption: docCaption.trim(),
                    mentions
                }, { quoted: info });
            }

            await require('../../services/media/avisoDownload').reagir(client, from, info, '✅');

            if (isPv && from !== sender) {
                return reply('📬 Mídia revelada enviada com sucesso no seu privado (DM)!');
            }
            return undefined;
        } catch (err) {
            logger.error('[REVELAR ERROR]', err);
            await require('../../services/media/avisoDownload').reagir(client, from, info, '❌');
            return reply('❌ Ocorreu um erro ao revelar esta mídia de visualização única. Tente reenviar.');
        }
    }
};
