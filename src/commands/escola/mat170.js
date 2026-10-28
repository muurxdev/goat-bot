/**
 * .mat170 — A forma da molécula pelo modelo VSEPR
 *
 * 📐 Geometria molecular. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "geometria" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "geometria"

module.exports = {
    name: "mat170",
    aliases: ["cmd_mat170","alt_mat170","atalho_mat170"],
    category: "escola",
    subcategory: "Química",
    description: "A forma da molécula pelo modelo VSEPR",
    usage: "<fórmula da molécula>",
    examples: ["H2O — a água","CO2","NH3 — a amônia"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat170", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
