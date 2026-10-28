/**
 * .mat95 — Onde o corpo está depois de acelerar
 *
 * 🛣️ MRUV: posição no tempo. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "mruvpos" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "mruvpos"

module.exports = {
    name: "mat95",
    aliases: ["cmd_mat95","alt_mat95","atalho_mat95"],
    category: "escola",
    subcategory: "Física",
    description: "Onde o corpo está depois de acelerar",
    usage: "<posição inicial> <velocidade inicial> <aceleração> <tempo>",
    examples: ["0 0 2 5 — parte parado com 2 m/s² por 5 s","10 20 -2 4","0 15 1,5 6"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat95", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
