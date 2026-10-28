/**
 * Filtro de Áudio: af_sub_bass
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_sub_bass',
    aliases: ["filtro_sub_bass"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Reforço focado na frequência de 40Hz sub-grave',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_sub_bass...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'sub_bass');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('sub_bass');
        return reply(doc || '🎧 *Filtro de Áudio af_sub_bass*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
