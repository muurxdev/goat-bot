/**
 * Comando .rankcmdgrupo — COMANDOS EM GRUPO
 *
 * Quem mais me chama dentro dos grupos.
 *
 * O ranking é escopado: dentro de um grupo lista só quem está naquele grupo.
 * A montagem fica em services/rankingService.js — aqui só a configuração.
 */

const { resolverEscopo, montarRanking } = require('../../services/rankingService')

module.exports = {
    name: 'rankcmdgrupo',
    aliases: ['topcmdgrupo'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Comandos em grupo — Quem mais me chama dentro dos grupos.',
    examples: [' — mostra o top 10 de comandos em grupo neste grupo (no PV, entre todos)'],
    cooldownMs: 2500,
    execute: async ({ reply, sender, from, isGroup }) => {
        const escopo = await resolverEscopo({ from, isGroup })
        return reply(montarRanking({
            coluna: "commands_group",
            titulo: "COMANDOS EM GRUPO",
            emoji: "🎛️",
            unidade: "cmds",
            escopo,
            senderJid: sender,
            detalhe: "Quem mais me chama dentro dos grupos."
        }))
    }
}
