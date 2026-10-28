/**
 * .mat70 — Acha o lado oposto sabendo dois lados e o ângulo
 *
 * 🧭 Lei dos cossenos. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "leicossenos" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "leicossenos"

module.exports = {
    name: "mat70",
    aliases: ["cmd_mat70","alt_mat70","atalho_mat70"],
    category: "escola",
    subcategory: "Matemática",
    description: "Acha o lado oposto sabendo dois lados e o ângulo",
    usage: "<lado b> <lado c> <ângulo entre eles>",
    examples: ["8 6 60 — lados 8 e 6 com 60 graus entre eles","5 7 45","10 10 90"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat70", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
