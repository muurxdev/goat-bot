const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'mirror',
    aliases: ['espelhar'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Espelha uma imagem horizontalmente',
    cooldownMs: 5000,
    execute: async ({ info, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.mirror` para espelhar.');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const result = await sharp(buffer).flop().jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: '🪞 Imagem espelhada horizontalmente.'
            }, { quoted: info });

            logger.info(`[MIRROR] Imagem espelhada por ${info.key.participant}`);
        } catch (err) {
            logger.error('[MIRROR ERROR]', err);
            await reply('❌ Não consegui espelhar essa imagem. Tente com outra foto.');
        }
    }
};
