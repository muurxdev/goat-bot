/**
 * Cifra de César com deslocamento de 18 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_18',
    aliases: ['cesar_18'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 18',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+18)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_18 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 18);
        return reply('🔐 *Texto Cifrado (Shift 18):*\n`' + ciphered + '`');
    }
};
