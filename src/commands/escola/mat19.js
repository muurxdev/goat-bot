/**
 * .mat19 — Juro sobre juro, com o crescimento período a período
 *
 * 🪙 Juros compostos. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "juroscompostos" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "juroscompostos"

module.exports = {
    name: "mat19",
    aliases: ["cmd_mat19","alt_mat19","atalho_mat19"],
    category: "escola",
    subcategory: "Matemática",
    description: "Juro sobre juro, com o crescimento período a período",
    usage: "<capital> <taxa % por período> <períodos>",
    examples: ["1000 2 12 — 1.000 a 2% ao mês por 1 ano","500 1 60 — poupança longa","10000 0,9 36"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat19", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
