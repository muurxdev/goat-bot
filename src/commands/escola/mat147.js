/**
 * .mat147 — Média ponderada dos isótopos pela abundância
 *
 * ⚖️ Massa atômica média. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "massaatomicamedia" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "massaatomicamedia"

module.exports = {
    name: "mat147",
    aliases: ["cmd_mat147","alt_mat147","atalho_mat147"],
    category: "escola",
    subcategory: "Química",
    description: "Média ponderada dos isótopos pela abundância",
    usage: "<massa> <abundância %> <massa> <abundância %> ...",
    examples: ["34,969 75,77 36,966 24,23 — os isótopos do cloro","10 19,9 11 80,1 — o boro","63 69,2 65 30,8"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat147", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
