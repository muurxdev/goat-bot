/**
 * Estilizador de Banner #73
 */
module.exports = {
    name: 'txt_estilo_73',
    aliases: ['estilo_banner_73'],
    category: 'texto',
    subcategory: 'Banners & Decorações',
    description: 'Decora frases com moldura ornamental estilo #73',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✨ *Moldura #73*\n\nDigite o texto que deseja emoldurar.\nExemplo: `.txt_estilo_73 Olá Mundo`');
        }
        const border = '═'.repeat(Math.min(30, Math.max(10, input.length + 6)));
        const doc = '꧁ ' + border + ' ꧂\n   ' + input + '\n꧁ ' + border + ' ꧂';
        return reply(doc);
    }
};
