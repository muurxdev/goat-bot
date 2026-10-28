/**
 * Filtro de Áudio: af_bassboost
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_bassboost',
    aliases: ["filtro_bassboost"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Aplica reforço potente de frequências graves (Bass Boost)',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_bassboost...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'bassboost');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('bassboost');
        return reply(doc || '🎧 *Filtro de Áudio af_bassboost*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
