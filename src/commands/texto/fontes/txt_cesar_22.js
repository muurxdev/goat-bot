/**
 * Cifra de César com deslocamento de 22 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_22',
    aliases: ['cesar_22'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 22',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+22)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_22 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 22);
        return reply('🔐 *Texto Cifrado (Shift 22):*\n`' + ciphered + '`');
    }
};
