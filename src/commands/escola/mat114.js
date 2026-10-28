/**
 * .mat114 — Energia por segundo, em watts e em cavalos
 *
 * ⚙️ Potência mecânica. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "potenciamecanica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "potenciamecanica"

module.exports = {
    name: "mat114",
    aliases: ["cmd_mat114","alt_mat114","atalho_mat114"],
    category: "escola",
    subcategory: "Física",
    description: "Energia por segundo, em watts e em cavalos",
    usage: "<trabalho em joules> <tempo em segundos>",
    examples: ["1000 5 — 1.000 J em 5 s","50000 10","735,5 1 — exatamente 1 cavalo-vapor"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat114", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
