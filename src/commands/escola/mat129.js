/**
 * .mat129 — Ângulo da luz ao passar de um meio para outro
 *
 * 💧 Refração: lei de Snell. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "snell" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "snell"

module.exports = {
    name: "mat129",
    aliases: ["cmd_mat129","alt_mat129","atalho_mat129"],
    category: "escola",
    subcategory: "Física",
    description: "Ângulo da luz ao passar de um meio para outro",
    usage: "<índice 1> <ângulo de incidência> <índice 2>",
    examples: ["1 30 1,33 — do ar para a água","1,33 40 1 — da água para o ar","1 45 1,5 — para o vidro"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat129", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
