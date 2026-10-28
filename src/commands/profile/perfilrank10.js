/**
 * Comando .rankcoinssemanal — MOEDAS DA SEMANA
 *
 * Quanto cada um faturou nos últimos 7 dias.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankcoinssemanal',
    aliases: ['topcoinssemana', 'rankweeklycoins'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Moedas da semana — Quanto cada um faturou nos últimos 7 dias.',
    examples: [' — mostra o top 10 de moedas da semana neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "weekly_coins",
            titulo: "MOEDAS DA SEMANA",
            emoji: "🗓️",
            tipo: "coins",
            escopo,
            senderJid: sender,
            detalhe: "Quanto cada um faturou nos últimos 7 dias."
        }))
    }
}
