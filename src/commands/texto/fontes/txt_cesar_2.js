/**
 * Cifra de César com deslocamento de 2 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_2',
    aliases: ['cesar_2'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 2',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+2)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_2 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 2);
        return reply('🔐 *Texto Cifrado (Shift 2):*\n`' + ciphered + '`');
    }
};
