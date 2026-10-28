/**
 * Cifra de César com deslocamento de 4 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_4',
    aliases: ['cesar_4'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 4',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+4)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_4 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 4);
        return reply('🔐 *Texto Cifrado (Shift 4):*\n`' + ciphered + '`');
    }
};
