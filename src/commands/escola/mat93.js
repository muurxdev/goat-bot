/**
 * .mat93 — Quanto a velocidade muda por segundo
 *
 * 📈 Aceleração média. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "aceleracao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "aceleracao"

module.exports = {
    name: "mat93",
    aliases: ["cmd_mat93","alt_mat93","atalho_mat93"],
    category: "escola",
    subcategory: "Física",
    description: "Quanto a velocidade muda por segundo",
    usage: "<velocidade inicial> <velocidade final> <tempo>",
    examples: ["0 100 8 — de 0 a 100 km/h em 8 s","20 5 3 — freando","0 30 6"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat93", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
