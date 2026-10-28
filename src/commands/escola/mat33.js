/**
 * .mat33 — Média com pesos: nota e peso alternados
 *
 * ⚖️ Média ponderada. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "mediaponderada" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "mediaponderada"

module.exports = {
    name: "mat33",
    aliases: ["cmd_mat33","alt_mat33","atalho_mat33"],
    category: "escola",
    subcategory: "Matemática",
    description: "Média com pesos: nota e peso alternados",
    usage: "<nota> <peso> <nota> <peso> ...",
    examples: ["8 2 6 3 — nota 8 peso 2 e nota 6 peso 3","7 1 9 4 5 2","10 3 4 1"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat33", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
