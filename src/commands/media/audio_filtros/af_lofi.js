/**
 * Filtro de Áudio: af_lofi
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_lofi',
    aliases: ["filtro_lofi"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Simula textura acústica analógica de fita cassete Lo-Fi',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_lofi...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'lofi');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('lofi');
        return reply(doc || '🎧 *Filtro de Áudio af_lofi*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
