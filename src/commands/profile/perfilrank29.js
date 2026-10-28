/**
 * Comando .rankbug — TOP BUG POWER
 *
 * Poder acumulado no sistema de bugs.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankbug',
    aliases: ['topbug', 'rankbugpower'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top bug power — Poder acumulado no sistema de bugs.',
    examples: [' — mostra o top 10 de bug power neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "bug_power",
            titulo: "TOP BUG POWER",
            emoji: "🐛",
            unidade: "BP",
            escopo,
            senderJid: sender,
            detalhe: "Poder acumulado no sistema de bugs."
        }))
    }
}
