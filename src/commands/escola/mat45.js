/**
 * .mat45 — Raiz cúbica, quarta, quinta: você escolhe
 *
 * 🌿 Raiz de qualquer índice. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "raizn" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "raizn"

module.exports = {
    name: "mat45",
    aliases: ["cmd_mat45","alt_mat45","atalho_mat45"],
    category: "escola",
    subcategory: "Matemática",
    description: "Raiz cúbica, quarta, quinta: você escolhe",
    usage: "<número> <índice>",
    examples: ["27 3 — raiz cúbica de 27","81 4 — raiz quarta","1000 3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat45", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
