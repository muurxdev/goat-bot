/**
 * Estilizador de Banner #20
 */
module.exports = {
    name: 'txt_estilo_20',
    aliases: ['estilo_banner_20'],
    category: 'texto',
    subcategory: 'Banners & Decorações',
    description: 'Decora frases com moldura ornamental estilo #20',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✨ *Moldura #20*\n\nDigite o texto que deseja emoldurar.\nExemplo: `.txt_estilo_20 Olá Mundo`');
        }
        const border = '═'.repeat(Math.min(30, Math.max(10, input.length + 6)));
        const doc = '★ ' + border + ' ★\n   ' + input + '\n★ ' + border + ' ★';
        return reply(doc);
    }
};
