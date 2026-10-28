/**
 * .mat30 — Diz por quais números ele é divisível e por quê
 *
 * ✂️ Regras de divisibilidade. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "divisibilidade" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "divisibilidade"

module.exports = {
    name: "mat30",
    aliases: ["cmd_mat30","alt_mat30","atalho_mat30"],
    category: "escola",
    subcategory: "Matemática",
    description: "Diz por quais números ele é divisível e por quê",
    usage: "<número>",
    examples: ["2520 — divisível por quase tudo","1234","990"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat30", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
