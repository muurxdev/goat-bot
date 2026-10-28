/**
 * .mat3 — Calcula o discriminante e diz o que ele significa
 *
 * 🔎 Delta: quantas raízes existem. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "delta" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "delta"

module.exports = {
    name: "mat3",
    aliases: ["cmd_mat3","alt_mat3","atalho_mat3"],
    category: "escola",
    subcategory: "Matemática",
    description: "Calcula o discriminante e diz o que ele significa",
    usage: "<equação ou a b c>",
    examples: ["1 -6 9 — coeficientes soltos","x² + 2x + 5 = 0 — delta negativo","2x² - 5x + 3 — delta positivo"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat3", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
