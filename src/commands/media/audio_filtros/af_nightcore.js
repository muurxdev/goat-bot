/**
 * Filtro de Áudio: af_nightcore
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_nightcore',
    aliases: ["filtro_nightcore"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Aumenta o pitch e a velocidade gerando efeito Nightcore',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_nightcore...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'nightcore');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('nightcore');
        return reply(doc || '🎧 *Filtro de Áudio af_nightcore*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
