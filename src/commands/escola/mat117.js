/**
 * .mat117 — Pressão a partir da força e da área
 *
 * 📌 Pressão. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "pressao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "pressao"

module.exports = {
    name: "mat117",
    aliases: ["cmd_mat117","alt_mat117","atalho_mat117"],
    category: "escola",
    subcategory: "Física",
    description: "Pressão a partir da força e da área",
    usage: "<força em N> <área em m²>",
    examples: ["700 0,03 — pessoa em pé sobre os dois pés","700 0,000001 — a mesma pessoa num salto agulha","1000 2"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat117", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
