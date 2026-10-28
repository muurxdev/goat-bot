/**
 * .mat26 — Lista todos os divisores e conta quantos são
 *
 * 🗂️ Divisores de um número. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "divisores" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "divisores"

module.exports = {
    name: "mat26",
    aliases: ["cmd_mat26","alt_mat26","atalho_mat26"],
    category: "escola",
    subcategory: "Matemática",
    description: "Lista todos os divisores e conta quantos são",
    usage: "<número>",
    examples: ["36 — tem nove divisores","100","97 — um primo só tem dois"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat26", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
