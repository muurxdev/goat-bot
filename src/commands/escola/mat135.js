/**
 * .mat135 — Resistência total quando estão em fila
 *
 * ➖ Resistores em série. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "resistoresserie" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "resistoresserie"

module.exports = {
    name: "mat135",
    aliases: ["cmd_mat135","alt_mat135","atalho_mat135"],
    category: "escola",
    subcategory: "Física",
    description: "Resistência total quando estão em fila",
    usage: "<resistência> <resistência> [mais]",
    examples: ["10 20 30 — três resistores em fila","100 220","4,7 4,7 4,7"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat135", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
