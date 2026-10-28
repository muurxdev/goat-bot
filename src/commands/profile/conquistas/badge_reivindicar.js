/**
 * Conquistas & Títulos: badge_reivindicar
 */
module.exports = {
    name: 'badge_reivindicar',
    aliases: ["conquista_reivindicar"],
    category: 'profile',
    subcategory: 'Conquistas & Badges',
    description: 'Verifica e reivindica conquistas pendentes',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const M = require('../../../utils/moldura');
        return reply(M.cabecalho('🏅', 'BADGE_REIVINDICAR') + '\n\n' +
            '📝 *Função:* Verifica e reivindica conquistas pendentes\n' +
            '💡 Use `.badge_vitrine` para ver suas conquistas ou `.badge_catalogo` para ver todos os títulos.');
    }
};
