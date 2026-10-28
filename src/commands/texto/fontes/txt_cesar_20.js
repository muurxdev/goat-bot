/**
 * Cifra de César com deslocamento de 20 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_20',
    aliases: ['cesar_20'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 20',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+20)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_20 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 20);
        return reply('🔐 *Texto Cifrado (Shift 20):*\n`' + ciphered + '`');
    }
};
