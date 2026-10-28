/**
 * Cifra de César com deslocamento de 8 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_8',
    aliases: ['cesar_8'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 8',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+8)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_8 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 8);
        return reply('🔐 *Texto Cifrado (Shift 8):*\n`' + ciphered + '`');
    }
};
