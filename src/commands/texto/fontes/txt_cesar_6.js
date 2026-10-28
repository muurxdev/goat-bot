/**
 * Cifra de César com deslocamento de 6 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_6',
    aliases: ['cesar_6'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 6',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+6)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_6 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 6);
        return reply('🔐 *Texto Cifrado (Shift 6):*\n`' + ciphered + '`');
    }
};
