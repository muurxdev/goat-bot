/**
 * Cifra de César com deslocamento de 14 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_14',
    aliases: ['cesar_14'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 14',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+14)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_14 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 14);
        return reply('🔐 *Texto Cifrado (Shift 14):*\n`' + ciphered + '`');
    }
};
