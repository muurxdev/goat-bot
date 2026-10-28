/**
 * Filtro de Áudio: af_vaporwave
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_vaporwave',
    aliases: ["filtro_vaporwave"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Desacelera a frequência e adiciona eco estilo Vaporwave retrô',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_vaporwave...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'vaporwave');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('vaporwave');
        return reply(doc || '🎧 *Filtro de Áudio af_vaporwave*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
