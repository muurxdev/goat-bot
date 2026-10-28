/**
 * .mat160 — Concentração final ao juntar dois preparos
 *
 * 🫗 Mistura de duas soluções. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "misturasolucoes" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "misturasolucoes"

module.exports = {
    name: "mat160",
    aliases: ["cmd_mat160","alt_mat160","atalho_mat160"],
    category: "escola",
    subcategory: "Química",
    description: "Concentração final ao juntar dois preparos",
    usage: "<C1> <V1> <C2> <V2>",
    examples: ["2 100 0,5 200 — juntando duas soluções","1 50 3 150","0,2 500 0,8 500"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat160", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
