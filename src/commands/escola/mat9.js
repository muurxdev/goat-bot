/**
 * .mat9 — Quando aumenta um lado e diminui o outro
 *
 * 🔄 Regra de três inversa. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "regratresinv" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "regratresinv"

module.exports = {
    name: "mat9",
    aliases: ["cmd_mat9","alt_mat9","atalho_mat9"],
    category: "escola",
    subcategory: "Matemática",
    description: "Quando aumenta um lado e diminui o outro",
    usage: "<a> <b> <c>",
    examples: ["4 12 6 — 4 pedreiros levam 12 dias, e 6 pedreiros?","2 90 3 — 2 torneiras enchem em 90 min, e 3?","60 4 80 — a 60 km/h leva 4 h, e a 80 km/h?"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat9", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
