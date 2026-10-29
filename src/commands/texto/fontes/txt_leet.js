/**
 * Estilizador de Texto: Conversor Leetspeak (1337)
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_leet',
    aliases: ['fonte_leet'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Conversor Leetspeak (1337)',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Conversor Leetspeak (1337)*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_leet ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toLeet(input);
        return reply(transformed);
    }
};
