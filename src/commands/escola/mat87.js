/**
 * .mat87 — Chance em % com casos favoráveis e possíveis
 *
 * 🍀 Probabilidade simples. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "probabilidade" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "probabilidade"

module.exports = {
    name: "mat87",
    aliases: ["cmd_mat87","alt_mat87","atalho_mat87"],
    category: "escola",
    subcategory: "Matemática",
    description: "Chance em % com casos favoráveis e possíveis",
    usage: "<casos favoráveis> <casos possíveis>",
    examples: ["1 6 — tirar o 5 num dado","13 52 — tirar uma carta de copas","4 10"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat87", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
