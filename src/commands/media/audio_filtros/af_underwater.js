/**
 * Filtro de Áudio: af_underwater
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_underwater',
    aliases: ["filtro_underwater"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Corte de agudos simulando mergulho no fundo do mar',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_underwater...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'underwater');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('underwater');
        return reply(doc || '🎧 *Filtro de Áudio af_underwater*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
