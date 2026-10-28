/**
 * Comando .rankstreak — TOP OFENSIVA DIÁRIA
 *
 * Dias seguidos coletando o .daily sem falhar.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankstreak',
    aliases: ['topstreak', 'rankofensiva'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top ofensiva diária — Dias seguidos coletando o .daily sem falhar.',
    examples: [' — mostra o top 10 de ofensiva diária neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "streak",
            titulo: "TOP OFENSIVA DIÁRIA",
            emoji: "🔥",
            unidade: "dias",
            escopo,
            senderJid: sender,
            detalhe: "Dias seguidos coletando o .daily sem falhar."
        }))
    }
}
