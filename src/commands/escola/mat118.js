/**
 * .mat118 — Pressão a certa profundidade, com e sem o ar
 *
 * 🤿 Pressão dentro da água. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "pressaohidrostatica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "pressaohidrostatica"

module.exports = {
    name: "mat118",
    aliases: ["cmd_mat118","alt_mat118","atalho_mat118"],
    category: "escola",
    subcategory: "Física",
    description: "Pressão a certa profundidade, com e sem o ar",
    usage: "<profundidade em m> [densidade do líquido em kg/m³]",
    examples: ["10 — dez metros de água","30 — mergulho profundo","2 13600 — coluna de mercúrio"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat118", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
