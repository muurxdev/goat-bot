/**
 * .mat112 — Energia guardada pela altura de um corpo
 *
 * 🏔️ Energia potencial gravitacional. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "energiapotencial" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "energiapotencial"

module.exports = {
    name: "mat112",
    aliases: ["cmd_mat112","alt_mat112","atalho_mat112"],
    category: "escola",
    subcategory: "Física",
    description: "Energia guardada pela altura de um corpo",
    usage: "<massa em kg> <altura em m>",
    examples: ["2 10 — 2 kg a 10 m de altura","70 3","1000 50 — água numa caixa alta"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat112", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
