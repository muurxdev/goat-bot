/**
 * Comando .rankmsggrupo — MENSAGENS EM GRUPO
 *
 * Só o que foi falado em grupos, sem contar o PV.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankmsggrupo',
    aliases: ['topmsggrupo'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Mensagens em grupo — Só o que foi falado em grupos, sem contar o PV.',
    examples: [' — mostra o top 10 de mensagens em grupo neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "messages_group",
            titulo: "MENSAGENS EM GRUPO",
            emoji: "👥",
            unidade: "msgs",
            escopo,
            senderJid: sender,
            detalhe: "Só o que foi falado em grupos, sem contar o PV."
        }))
    }
}
