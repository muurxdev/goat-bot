/**
 * .mat150 — Quantos gramas há na quantidade de mols
 *
 * ⚖️ De mols para gramas. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "molparamassa" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "molparamassa"

module.exports = {
    name: "mat150",
    aliases: ["cmd_mat150","alt_mat150","atalho_mat150"],
    category: "escola",
    subcategory: "Química",
    description: "Quantos gramas há na quantidade de mols",
    usage: "<mols> <fórmula>",
    examples: ["2 H2O — dois mols de água","0,5 NaCl","3 H2SO4"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat150", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
