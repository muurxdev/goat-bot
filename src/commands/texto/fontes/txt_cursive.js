/**
 * Estilizador de Texto: Fonte Cursiva Script
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cursive',
    aliases: ['fonte_cursive'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Fonte Cursiva Script',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Fonte Cursiva Script*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_cursive GOATBOT`');
        }
        const transformed = ts.toUnicodeFont(input, 'cursive');
        return reply(transformed);
    }
};
