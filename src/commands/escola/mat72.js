/**
 * .mat72 — Distância no plano cartesiano com os passos
 *
 * 📍 Distância entre dois pontos. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "distanciapontos" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "distanciapontos"

module.exports = {
    name: "mat72",
    aliases: ["cmd_mat72","alt_mat72","atalho_mat72"],
    category: "escola",
    subcategory: "Matemática",
    description: "Distância no plano cartesiano com os passos",
    usage: "<x1> <y1> <x2> <y2>",
    examples: ["0 0 3 4 — da origem ao ponto (3,4)","1 2 4 6","-2 5 3 -7"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat72", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
