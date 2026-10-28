/**
 * Comando .rankfarmpv — FARM NO PV
 *
 * Coletas feitas no privado.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankfarmpv',
    aliases: ['topfarmpv'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Farm no pv — Coletas feitas no privado.',
    examples: [' — mostra o top 10 de farm no PV neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "pv_farm_count",
            titulo: "FARM NO PV",
            emoji: "🌾",
            unidade: "farms",
            escopo,
            senderJid: sender,
            detalhe: "Coletas feitas no privado."
        }))
    }
}
