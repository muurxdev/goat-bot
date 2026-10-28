/**
 * Cifra de César com deslocamento de 24 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_24',
    aliases: ['cesar_24'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 24',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+24)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_24 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 24);
        return reply('🔐 *Texto Cifrado (Shift 24):*\n`' + ciphered + '`');
    }
};
