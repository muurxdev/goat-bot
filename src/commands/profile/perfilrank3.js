/**
 * Comando .rankrep — TOP REPUTAÇÃO
 *
 * Reputação vem de interações sociais e ajudas.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankrep',
    aliases: ['toprep', 'rankreputacao'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top reputação — Reputação vem de interações sociais e ajudas.',
    examples: [' — mostra o top 10 de reputação neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "rep",
            titulo: "TOP REPUTAÇÃO",
            emoji: "🤝",
            unidade: "rep",
            escopo,
            senderJid: sender,
            detalhe: "Reputação vem de interações sociais e ajudas."
        }))
    }
}
