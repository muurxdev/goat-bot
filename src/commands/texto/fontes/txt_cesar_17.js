/**
 * Cifra de César com deslocamento de 17 posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: 'txt_cesar_17',
    aliases: ['cesar_17'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift 17',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+17)*\n\nDigite o texto a ser cifrado.\nExemplo: `.txt_cesar_17 mensagem secreta`');
        }
        const ciphered = toCaesar(input, 17);
        return reply('🔐 *Texto Cifrado (Shift 17):*\n`' + ciphered + '`');
    }
};
