/**
 * .mat1 — Isola o x e mostra passo a passo
 *
 * 🧮 Equação do 1º grau. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "eq1grau" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "eq1grau"

module.exports = {
    name: "mat1",
    aliases: ["cmd_mat1","alt_mat1","atalho_mat1"],
    category: "escola",
    subcategory: "Matemática",
    description: "Isola o x e mostra passo a passo",
    usage: "<equação com x>",
    examples: ["2x + 6 = 0 — a mais direta de todas","3x - 9 = 12 — com número dos dois lados","5x = 2x + 12 — x dos dois lados"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat1", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
