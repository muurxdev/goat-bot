/**
 * Comando .rankfarmgrupo — FARM EM GRUPO
 *
 * Coletas feitas dentro de grupos.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankfarmgrupo',
    aliases: ['topfarmgrupo'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Farm em grupo — Coletas feitas dentro de grupos.',
    examples: [' — mostra o top 10 de farm em grupo neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "group_farm_count",
            titulo: "FARM EM GRUPO",
            emoji: "🚜",
            unidade: "farms",
            escopo,
            senderJid: sender,
            detalhe: "Coletas feitas dentro de grupos."
        }))
    }
}
