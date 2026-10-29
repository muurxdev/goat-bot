/**
 * Estilizador de Texto: Fonte Double Struck
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_double_struck',
    aliases: ['fonte_double_struck'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Fonte Double Struck',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Fonte Double Struck*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_double_struck ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toUnicodeFont(input, 'double_struck');
        return reply(transformed);
    }
};
