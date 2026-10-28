const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'rotate',
    aliases: ['rotacionar', 'giro'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Rotaciona uma imagem (90, 180 ou 270 graus)',
    cooldownMs: 5000,
    execute: async ({ info, text, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.rotate 90` (ou 180, 270) para girar.');
        }

        const angle = parseInt(text) || 90;
        if (![90, 180, 270].includes(angle)) {
            return reply('❌ Só giro em 90, 180 ou 270 graus.');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const result = await sharp(buffer).rotate(angle).jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: `🔄 Imagem girada ${angle}°.`
            }, { quoted: info });

            logger.info(`[ROTATE] Imagem rotacionada ${angle}° por ${info.key.participant}`);
        } catch (err) {
            logger.error('[ROTATE ERROR]', err);
            await reply('❌ Não consegui girar essa imagem. Tente com outra foto.');
        }
    }
};
