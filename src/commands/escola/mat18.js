/**
 * .mat18 — Juros sempre sobre o valor inicial, com passos
 *
 * 💰 Juros simples. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "jurossimples" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "jurossimples"

module.exports = {
    name: "mat18",
    aliases: ["cmd_mat18","alt_mat18","atalho_mat18"],
    category: "escola",
    subcategory: "Matemática",
    description: "Juros sempre sobre o valor inicial, com passos",
    usage: "<capital> <taxa % por período> <períodos>",
    examples: ["1000 2 12 — 1.000 a 2% ao mês por 12 meses","500 1,5 6","2500 0,8 24"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat18", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
