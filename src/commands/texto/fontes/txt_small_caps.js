/**
 * Estilizador de Texto: Fonte Small Caps
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_small_caps',
    aliases: ['fonte_small_caps'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Fonte Small Caps',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Fonte Small Caps*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_small_caps ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toUnicodeFont(input, 'small_caps');
        return reply(transformed);
    }
};
