const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

module.exports = {
    name: 'pixelart',
    aliases: ['pixel', 'pixelizar'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Aplica efeito pixel art em uma imagem',
    cooldownMs: 5000,
    execute: async ({ info, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.pixelart` para aplicar o efeito pixel art.');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Duas etapas: o sharp só aplica o último resize de uma mesma cadeia,
            // então encadear 64 e 512 devolvia a foto sem efeito nenhum.
            const pequena = await sharp(buffer)
                .resize(96, 96, { fit: 'inside' })
                .png()
                .toBuffer();
            const meta = await sharp(pequena).metadata();
            const escala = Math.max(1, Math.floor(768 / Math.max(meta.width || 96, meta.height || 96)));
            const result = await sharp(pequena)
                .resize((meta.width || 96) * escala, (meta.height || 96) * escala, { kernel: 'nearest' })
                .png({ compressionLevel: 9 })
                .toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: '👾 Efeito pixel art aplicado.'
            }, { quoted: info });

            logger.info(`[PIXELART] Pixel art aplicado por ${info.key.participant}`);
        } catch (err) {
            logger.error('[PIXELART ERROR]', err);
            await reply('❌ Não consegui aplicar o pixel art nessa imagem. Tente com outra foto.');
        }
    }
};
