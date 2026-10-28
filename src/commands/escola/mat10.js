/**
 * .mat10 — Três grandezas juntas, tudo proporcional
 *
 * 🧩 Regra de três composta. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "regratrescomp" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "regratrescomp"

module.exports = {
    name: "mat10",
    aliases: ["cmd_mat10","alt_mat10","atalho_mat10"],
    category: "escola",
    subcategory: "Matemática",
    description: "Três grandezas juntas, tudo proporcional",
    usage: "<pessoas1> <tempo1> <resultado1> <pessoas2> <tempo2>",
    examples: ["5 6 40 8 9 — 5 pessoas em 6 dias fazem 40 peças; e 8 pessoas em 9 dias?","3 8 120 6 4","10 5 200 15 5"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat10", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
