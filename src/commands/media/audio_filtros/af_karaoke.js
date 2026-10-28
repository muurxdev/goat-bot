/**
 * Filtro de Áudio: af_karaoke
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: 'af_karaoke',
    aliases: ["filtro_karaoke"],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: 'Atenua frequências do canal central para remover vocais',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro af_karaoke...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, 'karaoke');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('karaoke');
        return reply(doc || '🎧 *Filtro de Áudio af_karaoke*\n\nResponda a um áudio com este comando para aplicar.');
    }
};
