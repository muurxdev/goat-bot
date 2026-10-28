/**
 * .mat124 — Celsius, Fahrenheit e Kelvin de uma vez
 *
 * 🌡️ Converter temperaturas. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "temperaturaconv" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "temperaturaconv"

module.exports = {
    name: "mat124",
    aliases: ["cmd_mat124","alt_mat124","atalho_mat124"],
    category: "escola",
    subcategory: "Física",
    description: "Celsius, Fahrenheit e Kelvin de uma vez",
    usage: "<valor> <C|F|K>",
    examples: ["100 C — água fervendo","98,6 F — febre em Fahrenheit","300 K"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat124", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
