/**
 * Estilizador de Texto: Texto Sublinhado
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_underline',
    aliases: ['fonte_underline'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Texto Sublinhado',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Texto Sublinhado*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_underline GOATBOT`');
        }
        const transformed = ts.toUnderline(input);
        return reply(transformed);
    }
};
