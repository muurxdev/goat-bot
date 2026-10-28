const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'resize',
    aliases: ['redimensionar', 'tamanho'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Redimensiona uma imagem mantendo proporção (1 valor) ou distort (2 valores)',
    cooldownMs: 5000,
    execute: async ({ info, text, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.resize <largura> [altura]` para redimensionar.');
        }

        const parts = (text || '').trim().split(/\s+/);
        const width = parseInt(parts[0]);
        const height = parseInt(parts[1]);

        if (!width || width <= 0) {
            return reply('❌ Faltou o tamanho. Exemplo: `.resize 800` ou `.resize 800 600`\n• Um número mantém a proporção\n• Dois números usam o tamanho exato');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let result;
            if (height && height > 0) {
                result = await sharp(buffer).resize(width, height, { kernel: 'lanczos3' }).jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
            } else {
                result = await sharp(buffer).resize(width, null, { kernel: 'lanczos3' }).jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
            }

            const metadata = await sharp(result).metadata();

            await client.sendMessage(from, {
                image: result,
                caption: `📐 Imagem redimensionada para ${metadata.width}×${metadata.height}.`
            }, { quoted: info });

            logger.info(`[RESIZE] Imagem redimensionada por ${info.key.participant}`);
        } catch (err) {
            logger.error('[RESIZE ERROR]', err);
            await reply('❌ Não consegui redimensionar essa imagem. Tente com outra foto.');
        }
    }
};
