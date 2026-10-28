/**
 * .mat108 — Momento linear e o impulso para parar o corpo
 *
 * 🎳 Quantidade de movimento e impulso. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "quantmovimento" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "quantmovimento"

module.exports = {
    name: "mat108",
    aliases: ["cmd_mat108","alt_mat108","atalho_mat108"],
    category: "escola",
    subcategory: "Física",
    description: "Momento linear e o impulso para parar o corpo",
    usage: "<massa em kg> <velocidade em m/s>",
    examples: ["1000 20 — carro de 1 t a 72 km/h","0,145 40 — bola de beisebol","70 5"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat108", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
