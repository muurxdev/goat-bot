const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'crop',
    aliases: ['cortar', 'recortar'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Corta/redimensiona uma imagem com crop (cover)',
    cooldownMs: 5000,
    execute: async ({ info, text, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.crop <largura> <altura>` para cortar.');
        }

        const parts = (text || '').trim().split(/\s+/);
        const width = parseInt(parts[0]);
        const height = parseInt(parts[1]);

        if (!width || !height || width <= 0 || height <= 0) {
            return reply('❌ Faltou o tamanho. Exemplo: `.crop 800 600`');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const result = await sharp(buffer)
                .resize(width, height, { fit: 'cover' })
                .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
                .toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: `✂️ Cortada em ${width}×${height}.`
            }, { quoted: info });

            logger.info(`[CROP] Imagem cortada ${width}x${height} por ${info.key.participant}`);
        } catch (err) {
            logger.error('[CROP ERROR]', err);
            await reply('❌ Não consegui cortar essa imagem. Tente com outra foto.');
        }
    }
};
