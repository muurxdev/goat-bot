/**
 * Estilizador de Texto: Texto Corrompido Zalgo
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_zalgo',
    aliases: ['fonte_zalgo'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Texto Corrompido Zalgo',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Texto Corrompido Zalgo*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_zalgo ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toZalgo(input);
        return reply(transformed);
    }
};
