/**
 * Cifra de César com deslocamento de 23 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_23',
    aliases: ['cesar_23'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 23',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+23)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_23 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 23);
        return reply('🔐 *Texto Cifrado (Shift 23):*\n`' + ciphered + '`');
    }
};
