/**
 * Comando .rankbanco — TOP POUPANÇA
 *
 * Dinheiro guardado no banco rende e não se perde em assalto.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankbanco',
    aliases: ['topbanco', 'rankpoupanca'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top poupança — Dinheiro guardado no banco rende e não se perde em assalto.',
    examples: [' — mostra o top 10 de poupança neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "bank",
            titulo: "TOP POUPANÇA",
            emoji: "🏦",
            tipo: "coins",
            escopo,
            senderJid: sender,
            detalhe: "Dinheiro guardado no banco rende e não se perde em assalto."
        }))
    }
}
