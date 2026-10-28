/**
 * Cifra de César com deslocamento de 25 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_25',
    aliases: ['cesar_25'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 25',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+25)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_25 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 25);
        return reply('🔐 *Texto Cifrado (Shift 25):*\n`' + ciphered + '`');
    }
};
