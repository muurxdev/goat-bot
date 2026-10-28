/**
 * .mat106 — Força de uma mola esticada ou comprimida
 *
 * 🪀 Lei de Hooke (mola). Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "hooke" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "hooke"

module.exports = {
    name: "mat106",
    aliases: ["cmd_mat106","alt_mat106","atalho_mat106"],
    category: "escola",
    subcategory: "Física",
    description: "Força de uma mola esticada ou comprimida",
    usage: "<constante da mola em N/m> <deformação em metros>",
    examples: ["200 0,1 — mola de 200 N/m esticada 10 cm","50 0,25","1000 0,02"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat106", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
