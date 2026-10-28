/**
 * Comando .rankvitorias — TOP VITÓRIAS
 *
 * Vitórias em duelos, arena e desafios.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankvitorias',
    aliases: ['topvitorias', 'rankwins'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top vitórias — Vitórias em duelos, arena e desafios.',
    examples: [' — mostra o top 10 de vitórias neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "wins",
            titulo: "TOP VITÓRIAS",
            emoji: "🏆",
            unidade: "vitórias",
            escopo,
            senderJid: sender,
            detalhe: "Vitórias em duelos, arena e desafios."
        }))
    }
}
