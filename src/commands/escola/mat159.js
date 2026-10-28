/**
 * .mat159 — Concentração final ao acrescentar água
 *
 * 💧 Diluição de solução. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "diluicao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "diluicao"

module.exports = {
    name: "mat159",
    aliases: ["cmd_mat159","alt_mat159","atalho_mat159"],
    category: "escola",
    subcategory: "Química",
    description: "Concentração final ao acrescentar água",
    usage: "<concentração inicial> <volume inicial> <volume final>",
    examples: ["2 0,5 1 — meio litro a 2 mol/L virando 1 litro","10 100 250","0,5 50 200"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat159", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
