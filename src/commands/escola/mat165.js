/**
 * .mat165 — O caminho de volta: do pH para o mol/L
 *
 * 💧 Concentração de H+ pelo pH. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "hidrogenionica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "hidrogenionica"

module.exports = {
    name: "mat165",
    aliases: ["cmd_mat165","alt_mat165","atalho_mat165"],
    category: "escola",
    subcategory: "Química",
    description: "O caminho de volta: do pH para o mol/L",
    usage: "<pH>",
    examples: ["3 — solução bem ácida","7 — neutra","11,5"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat165", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
