/**
 * .mat50 — Área, perímetro e diagonal com base e altura
 *
 * ▭ Retângulo: área e perímetro. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "arearetangulo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "arearetangulo"

module.exports = {
    name: "mat50",
    aliases: ["cmd_mat50","alt_mat50","atalho_mat50"],
    category: "escola",
    subcategory: "Matemática",
    description: "Área, perímetro e diagonal com base e altura",
    usage: "<base> <altura>",
    examples: ["8 5 — cômodo de 8 por 5","3,2 4,5","120 80"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat50", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
