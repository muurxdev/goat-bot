/**
 * Cifra de César com deslocamento de 19 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_19',
    aliases: ['cesar_19'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 19',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+19)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_19 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 19);
        return reply('🔐 *Texto Cifrado (Shift 19):*\n`' + ciphered + '`');
    }
};
