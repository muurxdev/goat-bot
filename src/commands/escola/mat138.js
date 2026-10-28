/**
 * .mat138 — Converte kWh em reais usando a sua tarifa
 *
 * 🧾 Quanto custa na conta de luz. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "contadeluz" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "contadeluz"

module.exports = {
    name: "mat138",
    aliases: ["cmd_mat138","alt_mat138","atalho_mat138"],
    category: "escola",
    subcategory: "Física",
    description: "Converte kWh em reais usando a sua tarifa",
    usage: "<kWh> <tarifa por kWh>",
    examples: ["100 0,92 — 100 kWh a R$ 0,92","250 0,85","38 1,05"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat138", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
