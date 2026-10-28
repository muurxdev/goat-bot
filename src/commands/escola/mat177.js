/**
 * .mat177 — Densidade de um gás e se ele sobe ou desce no ar
 *
 * 💨 Densidade de um gás. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "densidadegas" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "densidadegas"

module.exports = {
    name: "mat177",
    aliases: ["cmd_mat177","alt_mat177","atalho_mat177"],
    category: "escola",
    subcategory: "Química",
    description: "Densidade de um gás e se ele sobe ou desce no ar",
    usage: "<fórmula ou massa molar> [pressão atm] [temperatura °C]",
    examples: ["CO2 — gás carbônico na CNTP","He — hélio","44 1 25 — pela massa molar"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat177", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
