/**
 * Comando .rankveteranos — VETERANOS DA CASA
 *
 * Quem chegou primeiro. Ordenado pela data de cadastro.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRankingVeteranos } = require('../../services/rankingService')

module.exports = {
    name: 'rankveteranos',
    aliases: ['topveteranos', 'rankantiguidade'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Veteranos da casa — Quem chegou primeiro. Ordenado pela data de cadastro.',
    examples: [' — mostra o top 10 de veteranos da casa neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRankingVeteranos({
            titulo: "VETERANOS DA CASA",
            emoji: "🏛️",
            escopo,
            senderJid: sender,
            detalhe: "Quem chegou primeiro. Ordenado pela data de cadastro."
        }))
    }
}
