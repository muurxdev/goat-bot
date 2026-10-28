/**
 * Estilizador de Banner #78
 */
module.exports = {
    name: 'txt_estilo_78',
    aliases: ['estilo_banner_78'],
    category: 'texto',
    subcategory: 'Banners & Decorações',
    description: 'Decora frases com moldura ornamental estilo #78',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✨ *Moldura #78*\n\nDigite o texto que deseja emoldurar.\nExemplo: `.txt_estilo_78 Olá Mundo`');
        }
        const border = '═'.repeat(Math.min(30, Math.max(10, input.length + 6)));
        const doc = '◈ ' + border + ' ◈\n   ' + input + '\n◈ ' + border + ' ◈';
        return reply(doc);
    }
};
