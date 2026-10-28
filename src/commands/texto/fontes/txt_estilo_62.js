/**
 * Estilizador de Banner #62
 */
module.exports = {
    name: 'txt_estilo_62',
    aliases: ['estilo_banner_62'],
    category: 'texto',
    subcategory: 'Banners & Decorações',
    description: 'Decora frases com moldura ornamental estilo #62',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✨ *Moldura #62*\n\nDigite o texto que deseja emoldurar.\nExemplo: `.txt_estilo_62 Olá Mundo`');
        }
        const border = '═'.repeat(Math.min(30, Math.max(10, input.length + 6)));
        const doc = '❖ ' + border + ' ❖\n   ' + input + '\n❖ ' + border + ' ❖';
        return reply(doc);
    }
};
