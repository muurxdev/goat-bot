/**
 * .mat151 — Quantos mols há na massa que você pesou
 *
 * 🔁 De gramas para mols. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "massaparamol" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "massaparamol"

module.exports = {
    name: "mat151",
    aliases: ["cmd_mat151","alt_mat151","atalho_mat151"],
    category: "escola",
    subcategory: "Química",
    description: "Quantos mols há na massa que você pesou",
    usage: "<gramas> <fórmula>",
    examples: ["36 H2O — 36 gramas de água","58,5 NaCl","100 CaCO3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat151", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
