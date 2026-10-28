const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'enhance',
    aliases: ['melhorar', 'sharpen', 'nitidez'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Melhora a nitidez de uma imagem (sharpen)',
    cooldownMs: 5000,
    execute: async ({ info, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.enhance` para melhorar a nitidez.');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const result = await sharp(buffer)
                .sharpen({ sigma: 1.5 })
                .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
                .toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: '✨ Imagem mais nítida.'
            }, { quoted: info });

            logger.info(`[ENHANCE] Imagem melhorada por ${info.key.participant}`);
        } catch (err) {
            logger.error('[ENHANCE ERROR]', err);
            await reply('❌ Não consegui melhorar essa imagem. Tente com outra foto.');
        }
    }
};
