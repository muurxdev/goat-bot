/**
 * Comando .rankconquistas — COLECIONADORES
 *
 * Quem tem mais conquistas desbloqueadas.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRankingColecao } = require('../../services/rankingService')

module.exports = {
    name: 'rankconquistas',
    aliases: ['topconquistas', 'rankmedalhas'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Colecionadores — Quem tem mais conquistas desbloqueadas.',
    examples: [' — mostra o top 10 de colecionadores neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRankingColecao({
            coluna: "conquistas",
            titulo: "COLECIONADORES",
            emoji: "🎖️",
            rotulo: "conquistas",
            escopo,
            senderJid: sender,
            detalhe: "Quem tem mais conquistas desbloqueadas."
        }))
    }
}
