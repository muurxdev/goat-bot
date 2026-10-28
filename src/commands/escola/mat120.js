/**
 * .mat120 — Força multiplicada pelo princípio de Pascal
 *
 * 🔧 Prensa hidráulica. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "prensahidraulica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "prensahidraulica"

module.exports = {
    name: "mat120",
    aliases: ["cmd_mat120","alt_mat120","atalho_mat120"],
    category: "escola",
    subcategory: "Física",
    description: "Força multiplicada pelo princípio de Pascal",
    usage: "<força aplicada> <área pequena> <área grande>",
    examples: ["100 0,01 0,5 — 100 N virando muito mais","50 0,002 0,1","200 0,05 1"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat120", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
