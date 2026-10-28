/**
 * .mat180 — Nome e fórmula pelo nº de carbonos e a função
 *
 * ✍️ Montar o nome de um composto. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "nomenclaturaorganica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "nomenclaturaorganica"

module.exports = {
    name: "mat180",
    aliases: ["cmd_mat180","alt_mat180","atalho_mat180"],
    category: "escola",
    subcategory: "Química",
    description: "Nome e fórmula pelo nº de carbonos e a função",
    usage: "<número de carbonos> <função>",
    examples: ["2 alcool — o etanol","1 aldeido — o formol","3 cetona — a acetona"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat180", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
