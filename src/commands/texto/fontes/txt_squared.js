/**
 * Estilizador de Texto: Texto Quadrado
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_squared',
    aliases: ['fonte_squared'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Texto Quadrado',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Texto Quadrado*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_squared ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toUnicodeFont(input, 'squared');
        return reply(transformed);
    }
};
