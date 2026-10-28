/**
 * Comando .rankcoinsgrupo — MOEDAS EM GRUPO
 *
 * Moedas ganhas dentro de grupos.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankcoinsgrupo',
    aliases: ['topcoinsgrupo'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Moedas em grupo — Moedas ganhas dentro de grupos.',
    examples: [' — mostra o top 10 de moedas em grupo neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "coins_group",
            titulo: "MOEDAS EM GRUPO",
            emoji: "🎰",
            tipo: "coins",
            escopo,
            senderJid: sender,
            detalhe: "Moedas ganhas dentro de grupos."
        }))
    }
}
