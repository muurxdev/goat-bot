/**
 * .mat55 — Área do losango pelas duas diagonais
 *
 * 🔷 Losango: área. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "arealosango" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "arealosango"

module.exports = {
    name: "mat55",
    aliases: ["cmd_mat55","alt_mat55","atalho_mat55"],
    category: "escola",
    subcategory: "Matemática",
    description: "Área do losango pelas duas diagonais",
    usage: "<diagonal maior> <diagonal menor>",
    examples: ["12 8 — diagonais 12 e 8","10 6","7,5 4"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat55", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
