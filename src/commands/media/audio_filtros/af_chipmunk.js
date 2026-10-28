/**
 * Filtro de Áudio: af_chipmunk
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_chipmunk',
    aliases: ["filtro_chipmunk"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Afina o pitch simulando voz cômica de esquilo',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_chipmunk...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'chipmunk');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('chipmunk');
        return reply(doc || '🎧 *Filtro de Áudio af_chipmunk*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
