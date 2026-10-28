/**
 * .mat158 — Molaridade a partir da massa e do volume
 *
 * 🧫 Concentração em mol/L. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "molaridade" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "molaridade"

module.exports = {
    name: "mat158",
    aliases: ["cmd_mat158","alt_mat158","atalho_mat158"],
    category: "escola",
    subcategory: "Química",
    description: "Molaridade a partir da massa e do volume",
    usage: "<massa em g> <fórmula> <volume em litros>",
    examples: ["58,5 NaCl 1 — um mol de sal por litro","40 NaOH 2","98 H2SO4 0,5"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat158", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
