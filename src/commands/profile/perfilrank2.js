/**
 * Comando .ranklevel — TOP NÍVEL
 *
 * Nível principal do personagem.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'ranklevel',
    aliases: ['toplevel', 'ranknivel'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top nível — Nível principal do personagem.',
    examples: [' — mostra o top 10 de nível neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "level",
            titulo: "TOP NÍVEL",
            emoji: "🎚️",
            tipo: "nivel",
            escopo,
            senderJid: sender,
            detalhe: "Nível principal do personagem."
        }))
    }
}
