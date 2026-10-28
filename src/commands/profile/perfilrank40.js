/**
 * Comando .rankelementos — ELEMENTOS DOMINANTES
 *
 * Qual elemento os jogadores mais escolhem.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRankingAgrupado } = require('../../services/rankingService')

module.exports = {
    name: 'rankelementos',
    aliases: ['topelementos', 'rankelemento'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Elementos dominantes — Qual elemento os jogadores mais escolhem.',
    examples: [' — mostra o top 10 de elementos dominantes neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRankingAgrupado({
            coluna: "character_element",
            titulo: "ELEMENTOS DOMINANTES",
            emoji: "🔮",
            rotulo: "jogadores",
            escopo,
            senderJid: sender,
            detalhe: "Qual elemento os jogadores mais escolhem."
        }))
    }
}
