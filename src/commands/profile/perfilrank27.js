/**
 * Comando .rankataque — TOP ATAQUE
 *
 * Poder de ataque bruto do personagem.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankataque',
    aliases: ['topataque', 'rankatk'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top ataque — Poder de ataque bruto do personagem.',
    examples: [' — mostra o top 10 de ataque neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "atk",
            titulo: "TOP ATAQUE",
            emoji: "🗡",
            unidade: "ATK",
            escopo,
            senderJid: sender,
            detalhe: "Poder de ataque bruto do personagem."
        }))
    }
}
