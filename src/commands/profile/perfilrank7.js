/**
 * Comando .rankbosses — CAÇADORES DE BOSS
 *
 * Chefes derrubados no .boss e nas dungeons.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankbosses',
    aliases: ['topbosses', 'rankcacadores'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Caçadores de boss — Chefes derrubados no .boss e nas dungeons.',
    examples: [' — mostra o top 10 de caçadores de boss neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "bosses_mortos",
            titulo: "CAÇADORES DE BOSS",
            emoji: "🐉",
            unidade: "bosses",
            escopo,
            senderJid: sender,
            detalhe: "Chefes derrubados no .boss e nas dungeons."
        }))
    }
}
