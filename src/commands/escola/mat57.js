/**
 * .mat57 — A volta completa de um círculo pelo raio
 *
 * 🛞 Comprimento da circunferência. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "circunferencia" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "circunferencia"

module.exports = {
    name: "mat57",
    aliases: ["cmd_mat57","alt_mat57","atalho_mat57"],
    category: "escola",
    subcategory: "Matemática",
    description: "A volta completa de um círculo pelo raio",
    usage: "<raio>",
    examples: ["5 — raio 5","0,33 — roda de bicicleta em metros","35"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat57", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
