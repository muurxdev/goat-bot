/**
 * Comando .contarconfiaveis — Quantas pessoas estão na lista de confiança
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'contarconfiaveis',
    aliases: ["quantosconfiaveis"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quantas pessoas estão na lista de confiança',
    examples: [' — conta a lista de confiança'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const lista = G.confiaveis()
    const n = lista.length
    if (!n) {
        return reply(F.tela({
            emoji: '🤝',
            titulo: "Lista de confiança vazia",
            intro: "Quem está na lista de confiança escapa de algumas restrições.",
            secoes: [{ emoji: '🛠️', titulo: "Para adicionar", linhas: ['• ' + F.cmd(prefix, 'trust', '@pessoa motivo') + ' — coloca a pessoa na lista'] }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🤝',
        titulo: plural(n, "pessoa de confiança", "pessoas de confiança"),
        intro: "Quem está na lista de confiança escapa de algumas restrições.",
        secoes: [null],
        proximos: [{ nome: 'confiaveisbot', oque: 'quem está na lista' }],
        prefix
    }))
    }
}
