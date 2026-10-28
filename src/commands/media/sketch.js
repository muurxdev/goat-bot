const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'sketch',
    aliases: ['lapis', 'desenho'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Aplica efeito sketch/lápis em uma imagem',
    cooldownMs: 5000,
    execute: async ({ info, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.sketch` para aplicar o efeito desenho a lápis.');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const grayscale = await sharp(buffer).grayscale().png().toBuffer();
            const inverted = await sharp(grayscale).negate().png().toBuffer();
            const blurred = await sharp(inverted).blur(1).png().toBuffer();
            // A base é o cinza e a sobreposição é o borrado-invertido, não o
            // contrário: color-dodge é assimétrico (Cr = Cb/(1-Cs)). Invertido,
            // o desvio padrão da saída cai de ~20 para ~6 — sai quase tudo
            // branco, sem os traços de lápis.
            const result = await sharp(grayscale)
                .composite([{
                    input: blurred,
                    blend: 'color-dodge'
                }])
                .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
                .toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: '✏️ Efeito desenho a lápis aplicado.'
            }, { quoted: info });

            logger.info(`[SKETCH] Sketch aplicado por ${info.key.participant}`);
        } catch (err) {
            logger.error('[SKETCH ERROR]', err);
            await reply('❌ Não consegui aplicar o desenho a lápis nessa imagem. Tente com outra foto.');
        }
    }
};
