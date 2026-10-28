/**
 * Comando .rankdefesa — TOP DEFESA
 *
 * Defesa bruta — o que decide duelos longos.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankdefesa',
    aliases: ['topdefesa', 'rankdef'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top defesa — Defesa bruta — o que decide duelos longos.',
    examples: [' — mostra o top 10 de defesa neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "def",
            titulo: "TOP DEFESA",
            emoji: "🛡️",
            unidade: "DEF",
            escopo,
            senderJid: sender,
            detalhe: "Defesa bruta — o que decide duelos longos."
        }))
    }
}
