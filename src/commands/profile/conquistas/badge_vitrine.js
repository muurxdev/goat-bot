/**
 * Conquistas & Títulos: badge_vitrine
 */
module.exports = {
    name: 'badge_vitrine',
    aliases: ["conquista_vitrine"],
    category: 'profile',
    subcategory: 'Conquistas & Badges',
    description: 'Exibe a vitrine de insígnias e troféus desbloqueados',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const { renderShowcase } = require('../../../services/badgeService');
        const doc = renderShowcase(sender);
        return reply(doc);
    }
};
