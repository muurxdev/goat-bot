/**
 * Conquistas & Títulos: badge_ranking
 */
module.exports = {
    name: 'badge_ranking',
    aliases: ["conquista_ranking"],
    category: 'profile',
    subcategory: 'Conquistas & Badges',
    description: 'Ranking dos membros com mais insígnias desbloqueadas',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const M = require('../../../utils/moldura');
        return reply(M.cabecalho('🏅', 'BADGE_RANKING') + '\n\n' +
            '📝 *Função:* Ranking dos membros com mais insígnias desbloqueadas\n' +
            '💡 Use `.badge_vitrine` para ver suas conquistas ou `.badge_catalogo` para ver todos os títulos.');
    }
};
