/**
 * .mat79 — Acha o enésimo termo de uma progressão aritmética
 *
 * ➕ PA: termo geral. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "pa" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "pa"

module.exports = {
    name: "mat79",
    aliases: ["cmd_mat79","alt_mat79","atalho_mat79"],
    category: "escola",
    subcategory: "Matemática",
    description: "Acha o enésimo termo de uma progressão aritmética",
    usage: "<primeiro termo> <razão> <posição>",
    examples: ["2 3 10 — começa em 2, soma 3, quero o 10º","100 -5 12 — razão negativa","1 2 50"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat79", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
