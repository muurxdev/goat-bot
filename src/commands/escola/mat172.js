/**
 * .mat172 — Calcula o nox de um elemento na fórmula
 *
 * 🔋 Número de oxidação (nox). Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "nox" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "nox"

module.exports = {
    name: "mat172",
    aliases: ["cmd_mat172","alt_mat172","atalho_mat172"],
    category: "escola",
    subcategory: "Química",
    description: "Calcula o nox de um elemento na fórmula",
    usage: "<fórmula> <elemento>",
    examples: ["H2SO4 S — o enxofre no ácido sulfúrico","KMnO4 Mn","Fe2O3 Fe"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat172", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
