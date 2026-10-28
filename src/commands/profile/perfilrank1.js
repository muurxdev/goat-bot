/**
 * Comando .rankxp — TOP XP GERAL
 *
 * XP total acumulado somando grupo, PV e RPG.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankxp',
    aliases: ['topxp', 'xprank'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top xp geral — XP total acumulado somando grupo, PV e RPG.',
    examples: [' — mostra o top 10 de XP geral neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "xp",
            titulo: "TOP XP GERAL",
            emoji: "⭐",
            unidade: "XP",
            escopo,
            senderJid: sender,
            detalhe: "XP total acumulado somando grupo, PV e RPG."
        }))
    }
}
