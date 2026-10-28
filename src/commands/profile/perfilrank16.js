/**
 * Comando .rankxpgrupo — XP DE GRUPO
 *
 * XP ganho conversando em grupos.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankxpgrupo',
    aliases: ['topxpgrupo'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Xp de grupo — XP ganho conversando em grupos.',
    examples: [' — mostra o top 10 de XP de grupo neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "xp_group",
            titulo: "XP DE GRUPO",
            emoji: "🏟️",
            unidade: "XP",
            escopo,
            senderJid: sender,
            detalhe: "XP ganho conversando em grupos."
        }))
    }
}
