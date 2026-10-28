/**
 * .mat128 — Imagem num espelho côncavo ou convexo
 *
 * 🪞 Espelhos esféricos. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "espelhos" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "espelhos"

module.exports = {
    name: "mat128",
    aliases: ["cmd_mat128","alt_mat128","atalho_mat128"],
    category: "escola",
    subcategory: "Física",
    description: "Imagem num espelho côncavo ou convexo",
    usage: "<distância do objeto> <distância focal>",
    examples: ["30 10 — espelho côncavo de foco 10","20 -15 — espelho convexo","5 10"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat128", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
