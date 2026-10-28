/**
 * Cifra de César com deslocamento de 9 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_9',
    aliases: ['cesar_9'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 9',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+9)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_9 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 9);
        return reply('🔐 *Texto Cifrado (Shift 9):*\n`' + ciphered + '`');
    }
};
