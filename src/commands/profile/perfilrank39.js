/**
 * Comando .rankracas — RAÇAS DOMINANTES
 *
 * Distribuição de raças entre os personagens.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRankingAgrupado } = require('../../services/rankingService')

module.exports = {
    name: 'rankracas',
    aliases: ['topracas', 'rankraca'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Raças dominantes — Distribuição de raças entre os personagens.',
    examples: [' — mostra o top 10 de raças dominantes neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRankingAgrupado({
            coluna: "character_race",
            titulo: "RAÇAS DOMINANTES",
            emoji: "🧝",
            rotulo: "jogadores",
            escopo,
            senderJid: sender,
            detalhe: "Distribuição de raças entre os personagens."
        }))
    }
}
