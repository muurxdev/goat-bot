/**
 * Comando .rankxprpg — XP DE RPG
 *
 * XP de caçada, dungeon e boss.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankxprpg',
    aliases: ['topxprpg'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Xp de rpg — XP de caçada, dungeon e boss.',
    examples: [' — mostra o top 10 de XP de RPG neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "xp_rpg",
            titulo: "XP DE RPG",
            emoji: "🧬",
            unidade: "XP",
            escopo,
            senderJid: sender,
            detalhe: "XP de caçada, dungeon e boss."
        }))
    }
}
