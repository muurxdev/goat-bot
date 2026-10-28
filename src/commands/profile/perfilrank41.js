/**
 * Comando .rankpetsusados — PETS MAIS USADOS
 *
 * Os companheiros mais populares.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRankingAgrupado } = require('../../services/rankingService')

module.exports = {
    name: 'rankpetsusados',
    aliases: ['toppets', 'rankpet'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Pets mais usados — Os companheiros mais populares.',
    examples: [' — mostra o top 10 de pets mais usados neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRankingAgrupado({
            coluna: "pet",
            titulo: "PETS MAIS USADOS",
            emoji: "🐾",
            rotulo: "donos",
            escopo,
            senderJid: sender,
            detalhe: "Os companheiros mais populares."
        }))
    }
}
