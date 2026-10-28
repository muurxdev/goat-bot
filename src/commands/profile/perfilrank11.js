/**
 * Comando .rankmsgs — TOP TAGARELAS
 *
 * Total de mensagens que eu registrei de cada um.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankmsgs',
    aliases: ['topmsgs', 'rankconversa'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top tagarelas — Quem mais mandou mensagens desde que cheguei.',
    examples: [' — mostra o top 10 de tagarelas neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "messages",
            titulo: "TOP TAGARELAS",
            emoji: "💬",
            unidade: "msgs",
            escopo,
            senderJid: sender,
            detalhe: "Total de mensagens que eu registrei de cada um."
        }))
    }
}
