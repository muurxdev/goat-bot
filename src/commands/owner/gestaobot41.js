/**
 * Comando .contarrestricoes — Quantas pessoas estão impedidas de me usar no privado
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'contarrestricoes',
    aliases: ["quantasrestricoes"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quantas pessoas estão impedidas de me usar no privado',
    examples: [' — conta as restrições de privado'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const lista = G.restricoesPv()
    const n = lista.length
    if (!n) {
        return reply(F.tela({
            emoji: '🔒',
            titulo: "Nenhuma restrição no privado",
            intro: "Pessoas com restrição não conseguem me usar no privado.",
            secoes: [{ emoji: '🛠️', titulo: "Para restringir alguém", linhas: ['• ' + F.cmd(prefix, 'bandm', '@pessoa motivo') + ' — barra a pessoa no privado'] }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🔒',
        titulo: plural(n, "restrição no privado", "restrições no privado"),
        intro: "Pessoas com restrição não conseguem me usar no privado.",
        secoes: [null],
        proximos: [{ nome: 'restricoespv', oque: 'quem são e o motivo' }],
        prefix
    }))
    }
}
