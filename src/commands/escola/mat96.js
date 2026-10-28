/**
 * .mat96 — Velocidade final sem precisar saber o tempo
 *
 * 🎯 Equação de Torricelli. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "torricelli" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "torricelli"

module.exports = {
    name: "mat96",
    aliases: ["cmd_mat96","alt_mat96","atalho_mat96"],
    category: "escola",
    subcategory: "Física",
    description: "Velocidade final sem precisar saber o tempo",
    usage: "<velocidade inicial> <aceleração> <distância>",
    examples: ["0 2 100 — parte do repouso e anda 100 m","30 -5 50 — freando por 50 m","10 3 45"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat96", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
