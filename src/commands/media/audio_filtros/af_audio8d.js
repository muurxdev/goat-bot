/**
 * Filtro de Áudio: af_audio8d
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_audio8d',
    aliases: ["filtro_audio8d"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Simula som girando 360 graus em fones (Áudio 8D)',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_audio8d...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'audio8d');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('audio8d');
        return reply(doc || '🎧 *Filtro de Áudio af_audio8d*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
