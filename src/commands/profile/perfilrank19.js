/**
 * Comando .rankforja — MESTRES FERREIROS
 *
 * Nível de forja alcançado com .forjar.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankforja',
    aliases: ['topforja', 'rankferreiro'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Mestres ferreiros — Nível de forja alcançado com .forjar.',
    examples: [' — mostra o top 10 de mestres ferreiros neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "forge_level",
            titulo: "MESTRES FERREIROS",
            emoji: "🔨",
            tipo: "forja",
            escopo,
            senderJid: sender,
            detalhe: "Nível de forja alcançado com .forjar."
        }))
    }
}
