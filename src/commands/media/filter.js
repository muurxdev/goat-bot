const sharp = require('sharp');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const logger = require('../../core/logger');

const FILTERS = {
    vintage: { brightness: 0.9, saturation: 0.7, hue: 30 },
    retro: { brightness: 1.05, saturation: 0.6, hue: 15 },
    cool: { brightness: 1.0, saturation: 0.9, hue: 200 },
    warm: { brightness: 1.1, saturation: 1.1, hue: 30 },
    dramatic: { brightness: 1.2, saturation: 0.5, hue: 0 },
    bw: { brightness: 1.0, saturation: 0, hue: 0 }
};

module.exports = {
    name: 'filter',
    aliases: ['filtro', 'filtros'],
    category: 'media',
    subcategory: 'Imagem',
    description: 'Aplica filtros em uma imagem: vintage, retro, cool, warm, dramatic, bw',
    cooldownMs: 5000,
    execute: async ({ info, text, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.imageMessage) {
            return reply('❌ Responda a uma imagem com `.filter <tipo>`.\nTipos: vintage, retro, cool, warm, dramatic, bw');
        }

        const filterName = (text || '').trim().toLowerCase();
        const filter = FILTERS[filterName];

        if (!filter) {
            return reply('❌ Não conheço esse filtro. Os que tenho:\n• vintage\n• retro\n• cool\n• warm\n• dramatic\n• bw');
        }

        try {
            await require('../../services/media/avisoDownload').reagir(client, from, info, '⏳')

            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            let pipeline = sharp(buffer)
                .modulate({
                    brightness: filter.brightness,
                    saturation: filter.saturation,
                    hue: filter.hue
                });

            const result = await pipeline.jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();

            await client.sendMessage(from, {
                image: result,
                caption: `🎨 Filtro ${filterName} aplicado.`
            }, { quoted: info });

            logger.info(`[FILTER] Filtro ${filterName} aplicado por ${info.key.participant}`);
        } catch (err) {
            logger.error('[FILTER ERROR]', err);
            await reply('❌ Não consegui aplicar o filtro nessa imagem. Tente com outra foto.');
        }
    }
};
