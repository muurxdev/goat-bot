/**
 * Filtro de Áudio: af_treble_boost
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_treble_boost',
    aliases: ["filtro_treble_boost"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Realce de agudos cristalinos a 8kHz',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_treble_boost...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'treble_boost');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('treble_boost');
        return reply(doc || '🎧 *Filtro de Áudio af_treble_boost*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
