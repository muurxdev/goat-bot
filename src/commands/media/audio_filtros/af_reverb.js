/**
 * Filtro de Áudio: af_reverb
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_reverb',
    aliases: ["filtro_reverb"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Adiciona reverberação de grande salão de pedra',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_reverb...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'reverb');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('reverb');
        return reply(doc || '🎧 *Filtro de Áudio af_reverb*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
