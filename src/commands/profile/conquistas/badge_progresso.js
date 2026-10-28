/**
 * Conquistas & Títulos: badge_progresso
 */
module.exports = {
    name: 'badge_progresso',
    aliases: ["conquista_progresso"],
    category: 'profile',
    subcategory: 'Conquistas & Badges',
    description: 'Mostra o progresso percentual para novas conquistas',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const M = require('../../../utils/moldura');
        return reply(M.cabecalho('🏅', 'BADGE_PROGRESSO') + '\n\n' +
            '📝 *Função:* Mostra o progresso percentual para novas conquistas\n' +
            '💡 Use `.badge_vitrine` para ver suas conquistas ou `.badge_catalogo` para ver todos os títulos.');
    }
};
