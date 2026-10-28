/**
 * Comando .rankguildas — TOP GUILDAS
 *
 * Guildas ordenadas por população e XP somado.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRankingAgrupado } = require('../../services/rankingService')

module.exports = {
    name: 'rankguildas',
    aliases: ['topguildas', 'rankguilda'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top guildas — Guildas ordenadas por população e XP somado.',
    examples: [' — mostra o top 10 de guildas neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRankingAgrupado({
            coluna: "guilda",
            titulo: "TOP GUILDAS",
            emoji: "🛡️",
            rotulo: "membros",
            escopo,
            senderJid: sender,
            detalhe: "Guildas ordenadas por população e XP somado."
        }))
    }
}
