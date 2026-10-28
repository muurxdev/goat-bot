/**
 * .mat92 — Posição final com velocidade constante
 *
 * ➡️ Movimento uniforme (MRU). Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "mru" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "mru"

module.exports = {
    name: "mat92",
    aliases: ["cmd_mat92","alt_mat92","atalho_mat92"],
    category: "escola",
    subcategory: "Física",
    description: "Posição final com velocidade constante",
    usage: "<posição inicial> <velocidade> <tempo>",
    examples: ["0 20 5 — parte do zero a 20 m/s por 5 s","100 -10 4 — indo para trás","50 15 8"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat92", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
