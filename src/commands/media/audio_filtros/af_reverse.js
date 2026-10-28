/**
 * Filtro de Áudio: af_reverse
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_reverse',
    aliases: ["filtro_reverse"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Inverte totalmente a ordem temporal do áudio',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_reverse...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'reverse');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('reverse');
        return reply(doc || '🎧 *Filtro de Áudio af_reverse*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
