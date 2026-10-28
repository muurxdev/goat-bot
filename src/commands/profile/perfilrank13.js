/**
 * Comando .rankmsgpv — MENSAGENS NO PV
 *
 * Conversas diretas comigo, no privado.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankmsgpv',
    aliases: ['topmsgpv'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Mensagens no PV — Quem mais conversa comigo no privado.',
    examples: [' — mostra o top 10 de mensagens no PV neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "messages_pv",
            titulo: "MENSAGENS NO PV",
            emoji: "📩",
            unidade: "msgs",
            escopo,
            senderJid: sender,
            detalhe: "Conversas diretas comigo, no privado."
        }))
    }
}
