/**
 * Filtro de Áudio: af_darthvader
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_darthvader',
    aliases: ["filtro_darthvader"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Graves profundos e corte de agudos estilo vilão galáctico',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_darthvader...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'darthvader');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('darthvader');
        return reply(doc || '🎧 *Filtro de Áudio af_darthvader*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
