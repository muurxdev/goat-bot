/**
 * Estilizador de Texto: Fonte Monospace Código
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_monospace',
    aliases: ['fonte_monospace'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Fonte Monospace Código',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Fonte Monospace Código*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_monospace ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toUnicodeFont(input, 'monospace');
        return reply(transformed);
    }
};
