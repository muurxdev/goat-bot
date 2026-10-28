/**
 * .mat162 — Concentração de quantidades muito pequenas
 *
 * 🔬 Partes por milhão (ppm). Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "ppm" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "ppm"

module.exports = {
    name: "mat162",
    aliases: ["cmd_mat162","alt_mat162","atalho_mat162"],
    category: "escola",
    subcategory: "Química",
    description: "Concentração de quantidades muito pequenas",
    usage: "<massa do soluto> <massa da solução>",
    examples: ["0,002 1000 — 2 mg em 1 kg","0,5 1000000","0,0015 500"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat162", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
