/**
 * Estilizador de Texto: Fonte Gótica Fraktur
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_gothic',
    aliases: ['fonte_gothic'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Fonte Gótica Fraktur',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Fonte Gótica Fraktur*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_gothic GOATBOT`');
        }
        const transformed = ts.toUnicodeFont(input, 'gothic');
        return reply(transformed);
    }
};
