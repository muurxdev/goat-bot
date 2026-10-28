/**
 * Estilizador de Texto: Texto Estética Vaporwave
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_vaporwave',
    aliases: ['fonte_vaporwave'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Texto Estética Vaporwave',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Texto Estética Vaporwave*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_vaporwave GOATBOT`');
        }
        const transformed = ts.toVaporwave(input);
        return reply(transformed);
    }
};
