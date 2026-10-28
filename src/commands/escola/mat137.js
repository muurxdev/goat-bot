/**
 * .mat137 — Quantos kWh um aparelho gasta por mês
 *
 * 🔋 Consumo de energia em kWh. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "consumokwh" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "consumokwh"

module.exports = {
    name: "mat137",
    aliases: ["cmd_mat137","alt_mat137","atalho_mat137"],
    category: "escola",
    subcategory: "Física",
    description: "Quantos kWh um aparelho gasta por mês",
    usage: "<potência em W> <horas por dia> [dias]",
    examples: ["5500 0,5 30 — chuveiro meia hora por dia","100 8 30 — lâmpada acesa 8 h","350 24 30 — geladeira"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat137", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
