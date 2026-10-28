/**
 * .mat7 — Acha vértice, máximo ou mínimo e as raízes
 *
 * 🎢 Função do 2º grau: vértice. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "funcao2grau" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "funcao2grau"

module.exports = {
    name: "mat7",
    aliases: ["cmd_mat7","alt_mat7","atalho_mat7"],
    category: "escola",
    subcategory: "Matemática",
    description: "Acha vértice, máximo ou mínimo e as raízes",
    usage: "<a> <b> <c>",
    examples: ["1 -4 3 — parábola com mínimo","-2 8 -3 — parábola com máximo","1 2 5 — sem raiz real"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat7", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
