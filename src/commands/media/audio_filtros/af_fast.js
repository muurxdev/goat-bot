/**
 * Filtro de Áudio: af_fast
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_fast',
    aliases: ["filtro_fast"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Acelera a reprodução em 2x sem alterar o pitch',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_fast...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'fast');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('fast');
        return reply(doc || '🎧 *Filtro de Áudio af_fast*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
