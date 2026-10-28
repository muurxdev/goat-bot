/**
 * Comando .rankclasses — CLASSES DOMINANTES
 *
 * Qual classe está bombando por aqui.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRankingAgrupado } = require('../../services/rankingService')

module.exports = {
    name: 'rankclasses',
    aliases: ['topclasses', 'rankclasse'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Classes dominantes — Qual classe está bombando por aqui.',
    examples: [' — mostra o top 10 de classes dominantes neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRankingAgrupado({
            coluna: "classe",
            titulo: "CLASSES DOMINANTES",
            emoji: "🎭",
            rotulo: "jogadores",
            escopo,
            senderJid: sender,
            detalhe: "Qual classe está bombando por aqui."
        }))
    }
}
