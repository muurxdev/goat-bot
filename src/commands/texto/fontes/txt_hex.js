/**
 * Estilizador de Texto: Conversor para Hexadecimal
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_hex',
    aliases: ['fonte_hex'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Conversor para Hexadecimal',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Conversor para Hexadecimal*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_hex GOATBOT`');
        }
        const transformed = ts.toHex(input);
        return reply(transformed);
    }
};
