/**
 * Comando .rankcoinspv — MOEDAS NO PV
 *
 * Moedas ganhas em conversas privadas.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankcoinspv',
    aliases: ['topcoinspv'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Moedas no pv — Moedas ganhas em conversas privadas.',
    examples: [' — mostra o top 10 de moedas no PV neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "coins_pv",
            titulo: "MOEDAS NO PV",
            emoji: "🪙",
            tipo: "coins",
            escopo,
            senderJid: sender,
            detalhe: "Moedas ganhas em conversas privadas."
        }))
    }
}
