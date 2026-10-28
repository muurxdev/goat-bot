/**
 * .mat154 — Quanto por cento da massa é de cada elemento
 *
 * 🥧 Composição percentual. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "composicaopercentual" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "composicaopercentual"

module.exports = {
    name: "mat154",
    aliases: ["cmd_mat154","alt_mat154","atalho_mat154"],
    category: "escola",
    subcategory: "Química",
    description: "Quanto por cento da massa é de cada elemento",
    usage: "<fórmula química>",
    examples: ["H2O — quanto da água é oxigênio","C6H12O6 — glicose","NaHCO3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat154", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
