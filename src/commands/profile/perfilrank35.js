/**
 * Comando .rankprodutivo — QUEM MAIS ME CHAMA
 *
 * Comandos pedidos no grupo e no PV somados.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRankingComposto } = require('../../services/rankingService')

module.exports = {
    name: 'rankprodutivo',
    aliases: ['topprodutivo', 'rankuso'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Quem mais me chama — Comandos pedidos no grupo e no PV somados.',
    examples: [' — mostra quem mais me chama neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRankingComposto({
            partes: [ { coluna: "commands_group", peso: 1 }, { coluna: "commands_pv", peso: 1 } ],
            titulo: "QUEM MAIS ME CHAMA",
            emoji: "⚡",
            unidade: "cmds",
            escopo,
            senderJid: sender,
            detalhe: "Comandos pedidos no grupo e no PV somados."
        }))
    }
}
