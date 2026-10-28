/**
 * .mat53 — Área, diâmetro e comprimento a partir do raio
 *
 * ⭕ Círculo: área e comprimento. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "areacirculo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "areacirculo"

module.exports = {
    name: "mat53",
    aliases: ["cmd_mat53","alt_mat53","atalho_mat53"],
    category: "escola",
    subcategory: "Matemática",
    description: "Área, diâmetro e comprimento a partir do raio",
    usage: "<raio>",
    examples: ["5 — raio de 5","2,5","10"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat53", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
