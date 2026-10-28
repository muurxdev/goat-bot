/**
 * .mat94 — Velocidade depois de acelerar por certo tempo
 *
 * 🏎️ MRUV: velocidade no tempo. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "mruvvel" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "mruvvel"

module.exports = {
    name: "mat94",
    aliases: ["cmd_mat94","alt_mat94","atalho_mat94"],
    category: "escola",
    subcategory: "Física",
    description: "Velocidade depois de acelerar por certo tempo",
    usage: "<velocidade inicial> <aceleração> <tempo>",
    examples: ["0 2 10 — parte do repouso com 2 m/s²","20 -4 3 — freando","5 1,5 8"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat94", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
