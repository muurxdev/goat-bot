/**
 * .mat42 — Escreve um número decimal como fração exata
 *
 * 🧮 Decimal para fração. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "decimalfracao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "decimalfracao"

module.exports = {
    name: "mat42",
    aliases: ["cmd_mat42","alt_mat42","atalho_mat42"],
    category: "escola",
    subcategory: "Matemática",
    description: "Escreve um número decimal como fração exata",
    usage: "<número decimal>",
    examples: ["0,375 — vira 3/8","2,5","0,04"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat42", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
