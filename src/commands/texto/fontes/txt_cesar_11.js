/**
 * Cifra de César com deslocamento de 11 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_11',
    aliases: ['cesar_11'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 11',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+11)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_11 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 11);
        return reply('🔐 *Texto Cifrado (Shift 11):*\n`' + ciphered + '`');
    }
};
