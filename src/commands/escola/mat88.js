/**
 * .mat88 — Chance de tirar certa soma com dois dados
 *
 * 🎲 Probabilidade com dois dados. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "probdados" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "probdados"

module.exports = {
    name: "mat88",
    aliases: ["cmd_mat88","alt_mat88","atalho_mat88"],
    category: "escola",
    subcategory: "Matemática",
    description: "Chance de tirar certa soma com dois dados",
    usage: "<soma desejada>",
    examples: ["7 — a soma mais provável","12 — a mais difícil","4"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat88", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
