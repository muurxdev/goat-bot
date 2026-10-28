/**
 * Comando .rankxppv — XP DE PV
 *
 * XP ganho no privado, contado separado.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankxppv',
    aliases: ['topxppv'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Xp de pv — XP ganho no privado, contado separado.',
    examples: [' — mostra o top 10 de XP de PV neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "xp_pv",
            titulo: "XP DE PV",
            emoji: "🔒",
            unidade: "XP",
            escopo,
            senderJid: sender,
            detalhe: "XP ganho no privado, contado separado."
        }))
    }
}
