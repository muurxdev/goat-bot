/**
 * Estilizador de Texto: Codificador Base64
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_base64',
    aliases: ['fonte_base64'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Codificador Base64',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Codificador Base64*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_base64 ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤`');
        }
        const transformed = ts.toBase64(input);
        return reply(transformed);
    }
};
