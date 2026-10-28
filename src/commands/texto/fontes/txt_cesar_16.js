/**
 * Cifra de César com deslocamento de 16 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_16',
    aliases: ['cesar_16'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 16',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+16)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_16 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 16);
        return reply('🔐 *Texto Cifrado (Shift 16):*\n`' + ciphered + '`');
    }
};
