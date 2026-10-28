/**
 * .mat52 — Fórmula de Heron quando só se sabe os lados
 *
 * 📐 Triângulo: área pelos três lados. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "areaheron" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "areaheron"

module.exports = {
    name: "mat52",
    aliases: ["cmd_mat52","alt_mat52","atalho_mat52"],
    category: "escola",
    subcategory: "Matemática",
    description: "Fórmula de Heron quando só se sabe os lados",
    usage: "<lado a> <lado b> <lado c>",
    examples: ["3 4 5 — triângulo retângulo famoso","7 8 9","5 5 5 — equilátero"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat52", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
