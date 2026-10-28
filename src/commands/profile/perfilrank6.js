/**
 * Comando .rankderrotas — MURAL DAS DERROTAS
 *
 * Perder também é história. Ninguém sobe sem apanhar.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankderrotas',
    aliases: ['topderrotas', 'ranklosses'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Mural das derrotas — Perder também é história. Ninguém sobe sem apanhar.',
    examples: [' — mostra o top 10 de mural das derrotas neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "losses",
            titulo: "MURAL DAS DERROTAS",
            emoji: "💀",
            unidade: "derrotas",
            escopo,
            senderJid: sender,
            detalhe: "Perder também é história. Ninguém sobe sem apanhar."
        }))
    }
}
