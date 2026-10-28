/**
 * .mat163 — Mols de soluto por quilo de solvente
 *
 * 🧂 Molalidade (mol/kg). Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "molalidade" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "molalidade"

module.exports = {
    name: "mat163",
    aliases: ["cmd_mat163","alt_mat163","atalho_mat163"],
    category: "escola",
    subcategory: "Química",
    description: "Mols de soluto por quilo de solvente",
    usage: "<mols do soluto> <massa do solvente em kg>",
    examples: ["0,5 1 — meio mol por quilo","2 0,25","0,1 0,5"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat163", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
