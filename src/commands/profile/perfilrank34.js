/**
 * Comando .rankpatrimonio — PATRIMÔNIO TOTAL
 *
 * Carteira + banco + cofre. O número que realmente importa.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRankingComposto } = require('../../services/rankingService')

module.exports = {
    name: 'rankpatrimonio',
    aliases: ['toppatrimonio', 'rankfortuna'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Patrimônio total — Carteira + banco + cofre. O número que realmente importa.',
    examples: [' — mostra o top 10 de patrimônio total neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRankingComposto({
            partes: [ { coluna: "coins", peso: 1 }, { coluna: "bank", peso: 1 }, { coluna: "vault_coins", peso: 1 } ],
            titulo: "PATRIMÔNIO TOTAL",
            emoji: "💎",
            tipo: "coins",
            escopo,
            senderJid: sender,
            detalhe: "Carteira + banco + cofre. O número que realmente importa."
        }))
    }
}
