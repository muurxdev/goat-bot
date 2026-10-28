/**
 * Comando .rankrenascimento — TOP RENASCIMENTOS
 *
 * Quantas vezes zerou tudo para ficar mais forte.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankrenascimento',
    aliases: ['toprebirth', 'rankrebirth'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Top renascimentos — Quantas vezes zerou tudo para ficar mais forte.',
    examples: [' — mostra o top 10 de renascimentos neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "rebirth_count",
            titulo: "TOP RENASCIMENTOS",
            emoji: "🌀",
            unidade: "rebirths",
            escopo,
            senderJid: sender,
            detalhe: "Quantas vezes zerou tudo para ficar mais forte."
        }))
    }
}
