/**
 * .mat83 — Calcula n! e explica para que ele serve
 *
 * ❗ Fatorial. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "fatorial" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "fatorial"

module.exports = {
    name: "mat83",
    aliases: ["cmd_mat83","alt_mat83","atalho_mat83"],
    category: "escola",
    subcategory: "Matemática",
    description: "Calcula n! e explica para que ele serve",
    usage: "<número>",
    examples: ["5 — cinco fatorial","10","0 — o caso especial"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat83", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
