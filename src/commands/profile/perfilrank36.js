/**
 * Comando .rankaproveitamento — APROVEITAMENTO
 *
 * Vitórias sobre o total de partidas. Ganhar muito é fácil quando se joga pouco — por isso o mínimo.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRankingTaxa } = require('../../services/rankingService')

module.exports = {
    name: 'rankaproveitamento',
    aliases: ['topaproveitamento', 'rankwinrate'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Aproveitamento — Vitórias sobre o total de partidas. Ganhar muito é fácil quando se joga pouco — por isso o mínimo.',
    examples: [' — mostra o top 10 de aproveitamento neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRankingTaxa({
            numerador: "wins",
            denominadores: ["wins","losses"],
            minimo: 5,
            titulo: "APROVEITAMENTO",
            emoji: "📊",
            escopo,
            senderJid: sender,
            detalhe: "Vitórias sobre o total de partidas. Ganhar muito é fácil quando se joga pouco — por isso o mínimo."
        }))
    }
}
