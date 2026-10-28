/**
 * .mat123 — Misturando duas águas, qual a temperatura final
 *
 * 🌡️ Temperatura final da mistura. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "equilibriotermico" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "equilibriotermico"

module.exports = {
    name: "mat123",
    aliases: ["cmd_mat123","alt_mat123","atalho_mat123"],
    category: "escola",
    subcategory: "Física",
    description: "Misturando duas águas, qual a temperatura final",
    usage: "<massa 1> <temperatura 1> <massa 2> <temperatura 2>",
    examples: ["200 80 300 20 — café quente com água fria","500 90 500 10","100 0 400 50"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat123", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
