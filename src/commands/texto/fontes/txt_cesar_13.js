/**
 * Cifra de César com deslocamento de 13 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_13',
    aliases: ['cesar_13'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 13',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+13)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_13 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 13);
        return reply('🔐 *Texto Cifrado (Shift 13):*\n`' + ciphered + '`');
    }
};
