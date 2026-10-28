/**
 * Cifra de César com deslocamento de 21 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_21',
    aliases: ['cesar_21'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 21',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+21)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_21 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 21);
        return reply('🔐 *Texto Cifrado (Shift 21):*\n`' + ciphered + '`');
    }
};
