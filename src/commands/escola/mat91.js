/**
 * .mat91 — Velocidade média a partir da distância e do tempo
 *
 * 🚗 Velocidade média. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "vmedia" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "vmedia"

module.exports = {
    name: "mat91",
    aliases: ["cmd_mat91","alt_mat91","atalho_mat91"],
    category: "escola",
    subcategory: "Física",
    description: "Velocidade média a partir da distância e do tempo",
    usage: "<distância em km> <tempo em horas>",
    examples: ["120 2 — 120 km em 2 horas","450 5,5 — viagem longa","3 0,25 — caminhada de 15 minutos"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat91", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
