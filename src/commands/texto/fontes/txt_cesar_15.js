/**
 * Cifra de César com deslocamento de 15 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_15',
    aliases: ['cesar_15'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 15',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+15)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_15 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 15);
        return reply('🔐 *Texto Cifrado (Shift 15):*\n`' + ciphered + '`');
    }
};
