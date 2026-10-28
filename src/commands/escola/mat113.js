/**
 * .mat113 — Energia guardada numa mola deformada
 *
 * 🎯 Energia elástica da mola. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "energiaelastica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "energiaelastica"

module.exports = {
    name: "mat113",
    aliases: ["cmd_mat113","alt_mat113","atalho_mat113"],
    category: "escola",
    subcategory: "Física",
    description: "Energia guardada numa mola deformada",
    usage: "<constante da mola> <deformação em m>",
    examples: ["200 0,1 — mola de 200 N/m esticada 10 cm","500 0,05","80 0,3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat113", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
