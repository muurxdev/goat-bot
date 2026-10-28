/**
 * Cifra de César com deslocamento de 10 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_10',
    aliases: ['cesar_10'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 10',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+10)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_10 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 10);
        return reply('🔐 *Texto Cifrado (Shift 10):*\n`' + ciphered + '`');
    }
};
