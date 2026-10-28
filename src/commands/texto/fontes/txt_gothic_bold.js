/**
 * Estilizador de Texto: Fonte Gótica Bold
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_gothic_bold',
    aliases: ['fonte_gothic_bold'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para Fonte Gótica Bold',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *Fonte Gótica Bold*\n\nDigite seu texto após o comando para estilizar.\nExemplo: `.txt_gothic_bold GOATBOT`');
        }
        const transformed = ts.toUnicodeFont(input, 'gothic_bold');
        return reply(transformed);
    }
};
