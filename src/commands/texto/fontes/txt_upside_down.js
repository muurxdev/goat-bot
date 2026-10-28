/**
 * Estilizador de Texto: Texto Ponta-Cabeça
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_upside_down',
    aliases: ['fonte_upside_down'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Texto Ponta-Cabeça',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Texto Ponta-Cabeça*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_upside_down GOATBOT`');
        }
        const transformed = ts.toUpsideDown(input);
        return reply(transformed);
    }
};
