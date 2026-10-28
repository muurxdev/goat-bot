/**
 * Conquistas & Títulos: badge_catalogo
 */
module.exports = {
    name: 'badge_catalogo',
    aliases: ["conquista_catalogo"],
    category: 'profile',
    subcategory: 'Conquistas & Badges',
    description: 'Lista todas as insígnias e títulos existentes no reino',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const { listBadges } = require('../../../services/badgeService');
        const M = require('../../../utils/moldura');
        const all = listBadges();
        const lines = all.map(x => `• ${x.emoji} *${x.name}* [${x.tier}] — _${x.title}_`);
        const doc = [
            M.cabecalho('🏅', 'Catálogo de Insígnias do Reino'),
            lines.join('\n'),
            M.assinatura('GOAT Badges')
        ].join('\n\n');
        return reply(doc);
    }
};
