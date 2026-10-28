/**
 * .mat146 — Compara dois átomos e diz a relação entre eles
 *
 * 👯 Isótopos, isóbaros e isótonos. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "isotopos" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "isotopos"

module.exports = {
    name: "mat146",
    aliases: ["cmd_mat146","alt_mat146","atalho_mat146"],
    category: "escola",
    subcategory: "Química",
    description: "Compara dois átomos e diz a relação entre eles",
    usage: "<massa 1> <atômico 1> <massa 2> <atômico 2>",
    examples: ["12 6 14 6 — carbono-12 e carbono-14","40 20 40 18 — mesmo número de massa","24 12 23 11"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat146", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
