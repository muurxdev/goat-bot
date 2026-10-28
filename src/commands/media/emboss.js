const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'emboss',
    aliases: ['relevo', 'relevar'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Aplica efeito emboss (relevo) em uma imagem',
    cooldownMs: 5000,
    execute: async ({ info, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.emboss` para aplicar o efeito relevo.');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const kernel = Buffer.from([
                -2, -1, 0,
                -1,  1, 1,
                 0,  1, 2
            ]);

            const result = await sharp(buffer)
                .grayscale()
                .convolve({
                    width: 3,
                    height: 3,
                    kernel: Array.from(kernel)
                })
                .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
                .toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: '🏔️ Efeito relevo aplicado.'
            }, { quoted: info });

            logger.info(`[EMBOSS] Emboss aplicado por ${info.key.participant}`);
        } catch (err) {
            logger.error('[EMBOSS ERROR]', err);
            await reply('❌ Não consegui aplicar o relevo nessa imagem. Tente com outra foto.');
        }
    }
};
