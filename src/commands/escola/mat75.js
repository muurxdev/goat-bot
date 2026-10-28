/**
 * .mat75 — Área de um triângulo dados os três vértices
 *
 * 🗺️ Área do triângulo por coordenadas. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "areacoordenadas" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "areacoordenadas"

module.exports = {
    name: "mat75",
    aliases: ["cmd_mat75","alt_mat75","atalho_mat75"],
    category: "escola",
    subcategory: "Matemática",
    description: "Área de um triângulo dados os três vértices",
    usage: "<x1> <y1> <x2> <y2> <x3> <y3>",
    examples: ["0 0 4 0 0 3 — triângulo retângulo na origem","1 1 5 2 3 6","-2 0 2 0 0 4"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat75", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
