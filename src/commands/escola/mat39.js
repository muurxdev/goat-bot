/**
 * .mat39 — Multiplica ou divide duas frações, com os passos
 *
 * ✖️ Multiplicar e dividir frações. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "multiplicarfracao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "multiplicarfracao"

module.exports = {
    name: "mat39",
    aliases: ["cmd_mat39","alt_mat39","atalho_mat39"],
    category: "escola",
    subcategory: "Matemática",
    description: "Multiplica ou divide duas frações, com os passos",
    usage: "<fração> x <fração>",
    examples: ["2/3 x 3/4 — multiplicação","2/3 : 3/4 — divisão","5/8 x 2/5"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat39", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
