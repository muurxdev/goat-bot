/**
 * Estilizador de Texto: Texto Tachado
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_strike',
    aliases: ['fonte_strike'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Texto Tachado',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Texto Tachado*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_strike GOATBOT`');
        }
        const transformed = ts.toStrike(input);
        return reply(transformed);
    }
};
