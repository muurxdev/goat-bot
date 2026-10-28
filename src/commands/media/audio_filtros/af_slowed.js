/**
 * Filtro de Áudio: af_slowed
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_slowed',
    aliases: ["filtro_slowed"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Aplica andamento lento e reverberação profunda (Slowed + Reverb)',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_slowed...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'slowed');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('slowed');
        return reply(doc || '🎧 *Filtro de Áudio af_slowed*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
