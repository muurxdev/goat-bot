const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'oil',
    aliases: ['oleo', 'painting', 'pintura'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Aplica efeito oil painting (pintura a óleo) em uma imagem',
    cooldownMs: 5000,
    execute: async ({ info, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.oil` para aplicar o efeito pintura a óleo.');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const result = await sharp(buffer)
                .modulate({ brightness: 1.1, saturation: 1.3 })
                .blur(0.5)
                .sharpen({ sigma: 0.8 })
                .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
                .toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: '🎨 Efeito pintura a óleo aplicado.'
            }, { quoted: info });

            logger.info(`[OIL] Oil painting aplicado por ${info.key.participant}`);
        } catch (err) {
            logger.error('[OIL ERROR]', err);
            await reply('❌ Não consegui aplicar a pintura a óleo nessa imagem. Tente com outra foto.');
        }
    }
};
