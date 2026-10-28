/**
 * .mat51 — Área do triângulo com base e altura
 *
 * 🔺 Triângulo: área por base e altura. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "areatriangulo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "areatriangulo"

module.exports = {
    name: "mat51",
    aliases: ["cmd_mat51","alt_mat51","atalho_mat51"],
    category: "escola",
    subcategory: "Matemática",
    description: "Área do triângulo com base e altura",
    usage: "<base> <altura>",
    examples: ["10 6 — base 10 e altura 6","7,5 4","3 3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat51", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
