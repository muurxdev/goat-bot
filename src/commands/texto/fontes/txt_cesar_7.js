/**
 * Cifra de César com deslocamento de 7 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_7',
    aliases: ['cesar_7'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 7',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+7)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_7 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 7);
        return reply('🔐 *Texto Cifrado (Shift 7):*\n`' + ciphered + '`');
    }
};
