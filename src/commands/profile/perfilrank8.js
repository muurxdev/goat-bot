/**
 * Comando .rankarena — TOP ARENA
 *
 * Pontuação acumulada nas disputas de arena.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankarena',
    aliases: ['toparena', 'rankpvp'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top arena — Pontuação acumulada nas disputas de arena.',
    examples: [' — mostra o top 10 de arena neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "arena_pontos",
            titulo: "TOP ARENA",
            emoji: "⚔️",
            unidade: "pts",
            escopo,
            senderJid: sender,
            detalhe: "Pontuação acumulada nas disputas de arena."
        }))
    }
}
