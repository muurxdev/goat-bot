/**
 * Cifra de César com deslocamento de 5 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_5',
    aliases: ['cesar_5'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 5',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+5)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_5 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 5);
        return reply('🔐 *Texto Cifrado (Shift 5):*\n`' + ciphered + '`');
    }
};
