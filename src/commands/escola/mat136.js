/**
 * .mat136 — Resistência total quando estão lado a lado
 *
 * 🔀 Resistores em paralelo. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "resistoresparalelo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "resistoresparalelo"

module.exports = {
    name: "mat136",
    aliases: ["cmd_mat136","alt_mat136","atalho_mat136"],
    category: "escola",
    subcategory: "Física",
    description: "Resistência total quando estão lado a lado",
    usage: "<resistência> <resistência> [mais]",
    examples: ["10 20 — dois em paralelo","100 100 100","6 3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat136", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
