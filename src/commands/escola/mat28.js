/**
 * .mat28 — Testa se o número é primo e mostra a prova
 *
 * 🔍 É primo ou não?. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "ehprimo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "ehprimo"

module.exports = {
    name: "mat28",
    aliases: ["cmd_mat28","alt_mat28","atalho_mat28"],
    category: "escola",
    subcategory: "Matemática",
    description: "Testa se o número é primo e mostra a prova",
    usage: "<número>",
    examples: ["97 — é primo","91 — parece primo mas não é","2024"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat28", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
