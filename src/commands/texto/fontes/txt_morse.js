/**
 * Estilizador de Texto: Conversor de Código Morse
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_morse',
    aliases: ['fonte_morse'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Conversor de Código Morse',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Conversor de Código Morse*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_morse ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toMorse(input);
        return reply(transformed);
    }
};
