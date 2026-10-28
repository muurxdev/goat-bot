/**
 * .mat98 — Altura máxima e tempo de um objeto jogado pra cima
 *
 * 🚀 Lançamento vertical. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "lancvertical" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "lancvertical"

module.exports = {
    name: "mat98",
    aliases: ["cmd_mat98","alt_mat98","atalho_mat98"],
    category: "escola",
    subcategory: "Física",
    description: "Altura máxima e tempo de um objeto jogado pra cima",
    usage: "<velocidade inicial em m/s>",
    examples: ["20 — jogando para cima a 20 m/s","9,8","5"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat98", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
