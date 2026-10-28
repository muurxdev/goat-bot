/**
 * Comando .rankxpsemanal — XP DA SEMANA
 *
 * Zera toda semana — bom para quem começou agora.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankxpsemanal',
    aliases: ['topsemanal', 'rankweeklyxp'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Xp da semana — Zera toda semana — bom para quem começou agora.',
    examples: [' — mostra o top 10 de XP da semana neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "weekly_xp",
            titulo: "XP DA SEMANA",
            emoji: "📅",
            unidade: "XP",
            escopo,
            senderJid: sender,
            detalhe: "Zera toda semana — bom para quem começou agora."
        }))
    }
}
