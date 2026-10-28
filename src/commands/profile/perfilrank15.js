/**
 * Comando .rankcmdpv — COMANDOS NO PV
 *
 * Quem mais me chama no privado.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankcmdpv',
    aliases: ['topcmdpv'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Comandos no PV — Quem mais me chama no privado.',
    examples: [' — mostra o top 10 de comandos no PV neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "commands_pv",
            titulo: "COMANDOS NO PV",
            emoji: "🎚",
            unidade: "cmds",
            escopo,
            senderJid: sender,
            detalhe: "Quem mais me chama no privado."
        }))
    }
}
