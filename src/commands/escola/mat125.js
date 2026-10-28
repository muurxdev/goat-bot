/**
 * .mat125 — Quanto um corpo estica ao esquentar
 *
 * 📏 Dilatação de um comprimento. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "dilatacaolinear" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "dilatacaolinear"

module.exports = {
    name: "mat125",
    aliases: ["cmd_mat125","alt_mat125","atalho_mat125"],
    category: "escola",
    subcategory: "Física",
    description: "Quanto um corpo estica ao esquentar",
    usage: "<comprimento em m> <variação de temperatura> [material]",
    examples: ["100 30 aco — trilho de 100 m esquentando 30 graus","10 50 aluminio","2 40 cobre"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat125", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
