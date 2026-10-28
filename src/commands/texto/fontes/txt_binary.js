/**
 * Estilizador de Texto: Conversor para Binário
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_binary',
    aliases: ['fonte_binary'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Conversor para Binário',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Conversor para Binário*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_binary GOATBOT`');
        }
        const transformed = ts.toBinary(input);
        return reply(transformed);
    }
};
