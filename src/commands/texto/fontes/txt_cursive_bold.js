/**
 * Estilizador de Texto: Fonte Cursiva Bold
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cursive_bold',
    aliases: ['fonte_cursive_bold'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Fonte Cursiva Bold',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Fonte Cursiva Bold*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_cursive_bold ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toUnicodeFont(input, 'cursive_bold');
        return reply(transformed);
    }
};
