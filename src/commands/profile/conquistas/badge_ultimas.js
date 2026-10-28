/**
 * Conquistas & Títulos: badge_ultimas
 */
module.exports = {
    name: 'badge_ultimas',
    aliases: ["conquista_ultimas"],
    category: 'profile',
    subcategory: 'Conquistas & Badges',
    description: 'Mostra as últimas conquistas alcançadas no reino',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const M = require('../../../utils/moldura');
        return reply(M.cabecalho('🏅', 'BADGE_ULTIMAS') + '\n\n' +
            '📝 *Função:* Mostra as últimas conquistas alcançadas no reino\n' +
            '💡 Use `.badge_vitrine` para ver suas conquistas ou `.badge_catalogo` para ver todos os títulos.');
    }
};
