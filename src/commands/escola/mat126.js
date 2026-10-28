/**
 * .mat126 — Quanto um volume cresce ao esquentar
 *
 * 🛢️ Dilatação de um volume. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "dilatacaovolumetrica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "dilatacaovolumetrica"

module.exports = {
    name: "mat126",
    aliases: ["cmd_mat126","alt_mat126","atalho_mat126"],
    category: "escola",
    subcategory: "Física",
    description: "Quanto um volume cresce ao esquentar",
    usage: "<volume> <variação de temperatura> [material]",
    examples: ["50 20 aluminio — 50 litros esquentando 20 graus","1000 30 aco","2 40 vidro"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat126", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
