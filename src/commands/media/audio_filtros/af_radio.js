/**
 * Filtro de Áudio: af_radio
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_radio',
    aliases: ["filtro_radio"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Efeito de rádio transmissor militar walkie-talkie',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_radio...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'radio');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('radio');
        return reply(doc || '🎧 *Filtro de Áudio af_radio*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
