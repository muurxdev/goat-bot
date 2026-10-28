/**
 * .mat156 — Acha os coeficientes que fecham a equação
 *
 * ⚖️ Balancear equação química. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "balanceamento" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "balanceamento"

module.exports = {
    name: "mat156",
    aliases: ["cmd_mat156","alt_mat156","atalho_mat156"],
    category: "escola",
    subcategory: "Química",
    description: "Acha os coeficientes que fecham a equação",
    usage: "<reagentes> -> <produtos>",
    examples: ["H2 + O2 -> H2O — a formação da água","C3H8 + O2 -> CO2 + H2O — queima do gás de cozinha","Fe + O2 -> Fe2O3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat156", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
