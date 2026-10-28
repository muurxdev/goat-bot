/**
 * .mat43 — Eleva um número a qualquer expoente
 *
 * ⚡ Potência. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "potencia" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "potencia"

module.exports = {
    name: "mat43",
    aliases: ["cmd_mat43","alt_mat43","atalho_mat43"],
    category: "escola",
    subcategory: "Matemática",
    description: "Eleva um número a qualquer expoente",
    usage: "<base> <expoente>",
    examples: ["2 10 — dois elevado a dez","5 -2 — expoente negativo","9 0,5 — expoente fracionário é raiz"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat43", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
