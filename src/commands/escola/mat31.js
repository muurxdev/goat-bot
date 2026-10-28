/**
 * .mat31 — Tabuada de um número, até onde você quiser
 *
 * ✖️ Tabuada. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "tabuada" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "tabuada"

module.exports = {
    name: "mat31",
    aliases: ["cmd_mat31","alt_mat31","atalho_mat31"],
    category: "escola",
    subcategory: "Matemática",
    description: "Tabuada de um número, até onde você quiser",
    usage: "<número> [até quanto]",
    examples: ["7 — tabuada do 7 até o 10","12 20 — do 12 até o 20","9"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat31", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
