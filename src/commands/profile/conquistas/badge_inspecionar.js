/**
 * Conquistas & Títulos: badge_inspecionar
 */
module.exports = {
    name: 'badge_inspecionar',
    aliases: ["conquista_inspecionar"],
    category: 'profile',
    subcategory: 'Conquistas & Badges',
    description: 'Examina detalhes, raridade e requisitos de uma insígnia',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const M = require('../../../utils/moldura');
        return reply(M.cabecalho('🏅', 'BADGE_INSPECIONAR') + '\n\n' +
            '📝 *Função:* Examina detalhes, raridade e requisitos de uma insígnia\n' +
            '💡 Use `.badge_vitrine` para ver suas conquistas ou `.badge_catalogo` para ver todos os títulos.');
    }
};
