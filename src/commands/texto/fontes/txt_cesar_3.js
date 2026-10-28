/**
 * Cifra de César com deslocamento de 3 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_3',
    aliases: ['cesar_3'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 3',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+3)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_3 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 3);
        return reply('🔐 *Texto Cifrado (Shift 3):*\n`' + ciphered + '`');
    }
};
