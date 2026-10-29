/**
 * Estilizador de Texto: Texto Circular
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_circled',
    aliases: ['fonte_circled'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Texto Circular',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Texto Circular*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_circled ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toUnicodeFont(input, 'circled');
        return reply(transformed);
    }
};
