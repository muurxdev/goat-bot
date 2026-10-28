/**
 * Conquistas & Títulos: badge_ajuda
 */
module.exports = {
    name: 'badge_ajuda',
    aliases: ["conquista_ajuda"],
    category: 'profile',
    subcategory: 'Conquistas & Badges',
    description: 'Guia explicativo sobre o sistema de títulos e troféus',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const M = require('../../../utils/moldura');
        return reply(M.cabecalho('🏅', 'BADGE_AJUDA') + '\n\n' +
            '📝 *Função:* Guia explicativo sobre o sistema de títulos e troféus\n' +
            '💡 Use `.badge_vitrine` para ver suas conquistas ou `.badge_catalogo` para ver todos os títulos.');
    }
};
