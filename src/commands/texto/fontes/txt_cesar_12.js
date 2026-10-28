/**
 * Cifra de César com deslocamento de 12 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_12',
    aliases: ['cesar_12'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 12',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+12)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_12 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 12);
        return reply('🔐 *Texto Cifrado (Shift 12):*\n`' + ciphered + '`');
    }
};
