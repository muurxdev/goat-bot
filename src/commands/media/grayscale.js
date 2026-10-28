const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'grayscale',
    aliases: ['bw', 'cinza', 'pretoebranco'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Converte uma imagem para escala de cinza',
    cooldownMs: 5000,
    execute: async ({ info, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.grayscale` ou `.bw` para deixar em preto e branco.');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const result = await sharp(buffer).grayscale().jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: '⬛ Pronto, em preto e branco.'
            }, { quoted: info });

            logger.info(`[GRAYSCALE] Imagem convertida para cinza por ${info.key.participant}`);
        } catch (err) {
            logger.error('[GRAYSCALE ERROR]', err);
            await reply('❌ Não consegui converter essa imagem. Tente com outra foto.');
        }
    }
};
