/**
 * .mat40 — Reduz a fração à forma irredutível pelo MDC
 *
 * 🪒 Simplificar fração. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "simplificarfracao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "simplificarfracao"

module.exports = {
    name: "mat40",
    aliases: ["cmd_mat40","alt_mat40","atalho_mat40"],
    category: "escola",
    subcategory: "Matemática",
    description: "Reduz a fração à forma irredutível pelo MDC",
    usage: "<numerador>/<denominador>",
    examples: ["18/24 — vira 3/4","144/60","7/13 — já é irredutível"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat40", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
