/**
 * .mat12 — Converte centímetros do mapa em distância real
 *
 * 🗺️ Escala de mapa. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "escala" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "escala"

module.exports = {
    name: "mat12",
    aliases: ["cmd_mat12","alt_mat12","atalho_mat12"],
    category: "escola",
    subcategory: "Matemática",
    description: "Converte centímetros do mapa em distância real",
    usage: "<denominador da escala> <cm no mapa>",
    examples: ["50000 7 — escala 1:50.000, 7 cm no papel","25000 12,5 — mapa mais detalhado","1000000 3 — mapa de país"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat12", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
