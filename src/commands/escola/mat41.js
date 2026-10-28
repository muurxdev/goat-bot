/**
 * .mat41 — Transforma fração em número decimal e em %
 *
 * 🔟 Fração para decimal. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "fracaodecimal" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "fracaodecimal"

module.exports = {
    name: "mat41",
    aliases: ["cmd_mat41","alt_mat41","atalho_mat41"],
    category: "escola",
    subcategory: "Matemática",
    description: "Transforma fração em número decimal e em %",
    usage: "<numerador>/<denominador>",
    examples: ["3/8 — dá exato","1/3 — dízima periódica","7/4"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat41", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
