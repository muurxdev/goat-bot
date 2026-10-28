/**
 * Filtro de Áudio: af_slow
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_slow',
    aliases: ["filtro_slow"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Reduz o andamento para 0.75x mantendo o tom',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_slow...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'slow');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('slow');
        return reply(doc || '🎧 *Filtro de Áudio af_slow*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
