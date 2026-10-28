/**
 * .mat49 — Área, perímetro e diagonal a partir do lado
 *
 * ⬜ Quadrado: área e perímetro. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "areaquadrado" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "areaquadrado"

module.exports = {
    name: "mat49",
    aliases: ["cmd_mat49","alt_mat49","atalho_mat49"],
    category: "escola",
    subcategory: "Matemática",
    description: "Área, perímetro e diagonal a partir do lado",
    usage: "<lado>",
    examples: ["5 — lado de 5","2,5","12"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat49", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
