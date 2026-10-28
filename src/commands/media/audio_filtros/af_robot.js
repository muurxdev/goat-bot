/**
 * Filtro de Áudio: af_robot
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_robot',
    aliases: ["filtro_robot"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Converte vocais em sintetizador robótico vocoder',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_robot...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'robot');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('robot');
        return reply(doc || '🎧 *Filtro de Áudio af_robot*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
