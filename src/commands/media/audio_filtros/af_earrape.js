/**
 * Filtro de Áudio: af_earrape
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_earrape',
    aliases: ["filtro_earrape"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Overdrive extremo com saturação destrutiva de áudio',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_earrape...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'earrape');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('earrape');
        return reply(doc || '🎧 *Filtro de Áudio af_earrape*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
