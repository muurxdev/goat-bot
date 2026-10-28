/**
 * Comando .ranknivelrpg — NÍVEL DE RPG
 *
 * Nível de combate, separado do nível social.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'ranknivelrpg',
    aliases: ['topnivelrpg'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Nível de rpg — Nível de combate, separado do nível social.',
    examples: [' — mostra o top 10 de nível de RPG neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "level_rpg",
            titulo: "NÍVEL DE RPG",
            emoji: "🗡️",
            tipo: "nivel",
            escopo,
            senderJid: sender,
            detalhe: "Nível de combate, separado do nível social."
        }))
    }
}
