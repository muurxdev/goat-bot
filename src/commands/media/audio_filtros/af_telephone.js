/**
 * Filtro de Áudio: af_telephone
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_telephone',
    aliases: ["filtro_telephone"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Banda estreita de telefone residencial antigo',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_telephone...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'telephone');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('telephone');
        return reply(doc || '🎧 *Filtro de Áudio af_telephone*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
