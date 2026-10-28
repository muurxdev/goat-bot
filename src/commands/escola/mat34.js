/**
 * .mat34 — O valor do meio depois de colocar em ordem
 *
 * 🎯 Mediana. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "mediana" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "mediana"

module.exports = {
    name: "mat34",
    aliases: ["cmd_mat34","alt_mat34","atalho_mat34"],
    category: "escola",
    subcategory: "Matemática",
    description: "O valor do meio depois de colocar em ordem",
    usage: "<número> <número> [mais números]",
    examples: ["7 2 9 4 5 — cinco valores","10 20 30 40 — quantidade par","3 1 4 1 5 9 2"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat34", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
