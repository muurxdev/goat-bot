/**
 * .mat17 — De um valor para outro: subiu ou caiu quantos %
 *
 * 📉 Variação percentual. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "variacaopercent" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "variacaopercent"

module.exports = {
    name: "mat17",
    aliases: ["cmd_mat17","alt_mat17","atalho_mat17"],
    category: "escola",
    subcategory: "Matemática",
    description: "De um valor para outro: subiu ou caiu quantos %",
    usage: "<valor antigo> <valor novo>",
    examples: ["200 230 — subiu quantos por cento","5,89 4,99 — queda de preço","1320 1412 — reajuste do mínimo"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat17", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
