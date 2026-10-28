/**
 * .mat80 — Soma os n primeiros termos de uma PA
 *
 * 🧮 PA: soma dos termos. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "pasoma" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "pasoma"

module.exports = {
    name: "mat80",
    aliases: ["cmd_mat80","alt_mat80","atalho_mat80"],
    category: "escola",
    subcategory: "Matemática",
    description: "Soma os n primeiros termos de uma PA",
    usage: "<primeiro termo> <razão> <quantidade>",
    examples: ["1 1 100 — a soma que Gauss fez na infância","2 3 10","5 -1 20"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat80", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
