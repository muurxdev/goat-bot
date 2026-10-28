/**
 * Comando .rankcofre — TOP COFRE
 *
 * O cofre sobrevive até a reencarnação.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankcofre',
    aliases: ['topcofre', 'rankvault'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top cofre — O cofre sobrevive até a reencarnação.',
    examples: [' — mostra o top 10 de cofre neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "vault_coins",
            titulo: "TOP COFRE",
            emoji: "🔐",
            tipo: "coins",
            escopo,
            senderJid: sender,
            detalhe: "O cofre sobrevive até a reencarnação."
        }))
    }
}
