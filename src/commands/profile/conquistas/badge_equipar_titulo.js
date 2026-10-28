/**
 * Conquistas & Títulos: badge_equipar_titulo
 */
module.exports = {
    name: 'badge_equipar_titulo',
    aliases: ["conquista_equipar_titulo"],
    category: 'profile',
    subcategory: 'Conquistas & Badges',
    description: 'Equipa um título honorário no seu perfil público',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const M = require('../../../utils/moldura');
        return reply(M.cabecalho('🏅', 'BADGE_EQUIPAR_TITULO') + '\n\n' +
            '📝 *Função:* Equipa um título honorário no seu perfil público\n' +
            '💡 Use `.badge_vitrine` para ver suas conquistas ou `.badge_catalogo` para ver todos os títulos.');
    }
};
