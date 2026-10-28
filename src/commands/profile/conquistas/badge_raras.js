/**
 * Conquistas & Títulos: badge_raras
 */
module.exports = {
    name: 'badge_raras',
    aliases: ["conquista_raras"],
    category: 'profile',
    subcategory: 'Conquistas & Badges',
    description: 'Exibe as insígnias de grau Épico, Lendário e Mítico',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const M = require('../../../utils/moldura');
        return reply(M.cabecalho('🏅', 'BADGE_RARAS') + '\n\n' +
            '📝 *Função:* Exibe as insígnias de grau Épico, Lendário e Mítico\n' +
            '💡 Use `.badge_vitrine` para ver suas conquistas ou `.badge_catalogo` para ver todos os títulos.');
    }
};
