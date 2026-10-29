/**
 * Equalizador de Frequência FFmpeg: 3000 Hz
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'af_eq_3000hz',
    aliases: ["eq_3000hz"],
    category: 'media',
    subcategory: 'Equalizador Paramétrico',
    description: 'Ajusta ganho de equalização na frequência de 3000 Hz',
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const gain = args[0] ? parseInt(args[0], 10) : 6;
        const safeGain = isNaN(gain) ? 6 : Math.max(-24, Math.min(24, gain));
        const doc = [
            M.cabecalho('🎛️', 'Equalizador FFmpeg: 3000 Hz'),
            '📊 *Banda de Frequência:* 3000 Hz',
            '⚡ *Ganho Configurado:* ' + (safeGain > 0 ? '+' : '') + safeGain + ' dB',
            '⚙️ *Filtro FFmpeg:* `equalizer=f=3000:width_type=o:width=1:g=' + safeGain + '`',
            M.secao('💡', 'Instruções', [
                'Para equalizar um áudio, responda à mídia com o comando e o ganho desejado.',
                'Exemplo: `.af_eq_3000hz 10` (para amplificar) ou `.af_eq_3000hz -8` (para atenuar).'
            ]),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Studio')
        ].join('\n\n');
        return reply(doc);
    }
};
