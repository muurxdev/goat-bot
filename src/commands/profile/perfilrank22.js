/**
 * Comando .ranknivelgrupo — NÍVEL DE GRUPO
 *
 * Nível que só sobe com atividade em grupos.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'ranknivelgrupo',
    aliases: ['topnivelgrupo'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Nível de grupo — Nível que só sobe com atividade em grupos.',
    examples: [' — mostra o top 10 de nível de grupo neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "level_group",
            titulo: "NÍVEL DE GRUPO",
            emoji: "🏘️",
            tipo: "nivel",
            escopo,
            senderJid: sender,
            detalhe: "Nível que só sobe com atividade em grupos."
        }))
    }
}
