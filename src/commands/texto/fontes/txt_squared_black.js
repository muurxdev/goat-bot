/**
 * Estilizador de Texto: Texto Quadrado Preto
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_squared_black',
    aliases: ['fonte_squared_black'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Texto Quadrado Preto',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Texto Quadrado Preto*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_squared_black ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toUnicodeFont(input, 'squared_black');
        return reply(transformed);
    }
};
