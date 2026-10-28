/**
 * Cifra de César com deslocamento de 1 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_1',
    aliases: ['cesar_1'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 1',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+1)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_1 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 1);
        return reply('🔐 *Texto Cifrado (Shift 1):*\n`' + ciphered + '`');
    }
};
