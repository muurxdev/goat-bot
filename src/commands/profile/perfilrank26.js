/**
 * Comando .rankvida — TOP VITALIDADE
 *
 * Vida máxima, somando classe, equipamentos e bênçãos.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankvida',
    aliases: ['topvida', 'rankhp'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top vitalidade — Vida máxima, somando classe, equipamentos e bênçãos.',
    examples: [' — mostra o top 10 de vitalidade neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "hp_max",
            titulo: "TOP VITALIDADE",
            emoji: "❤️",
            unidade: "HP",
            escopo,
            senderJid: sender,
            detalhe: "Vida máxima, somando classe, equipamentos e bênçãos."
        }))
    }
}
