/**
 * .mat23 — Soma de depósitos mensais com juros compostos
 *
 * 🏦 Quanto rende guardando por mês. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "aportemensal" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "aportemensal"

module.exports = {
    name: "mat23",
    aliases: ["cmd_mat23","alt_mat23","atalho_mat23"],
    category: "escola",
    subcategory: "Matemática",
    description: "Soma de depósitos mensais com juros compostos",
    usage: "<depósito mensal> <taxa % ao mês> <meses>",
    examples: ["300 0,8 60 — 300 por mês durante 5 anos","100 1 120","1000 0,5 24"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat23", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
