/**
 * Comando .ranknivelpv — NÍVEL DE PV
 *
 * Nível que só sobe no privado.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'ranknivelpv',
    aliases: ['topnivelpv'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Nível de pv — Nível que só sobe no privado.',
    examples: [' — mostra o top 10 de nível de PV neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "level_pv",
            titulo: "NÍVEL DE PV",
            emoji: "🚪",
            tipo: "nivel",
            escopo,
            senderJid: sender,
            detalhe: "Nível que só sobe no privado."
        }))
    }
}
