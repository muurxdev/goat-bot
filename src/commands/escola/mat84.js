/**
 * .mat84 — Quantas palavras diferentes dá para montar
 *
 * 🔤 Anagramas de uma palavra. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "anagramas" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "anagramas"

module.exports = {
    name: "mat84",
    aliases: ["cmd_mat84","alt_mat84","atalho_mat84"],
    category: "escola",
    subcategory: "Matemática",
    description: "Quantas palavras diferentes dá para montar",
    usage: "<palavra>",
    examples: ["AMOR — quatro letras diferentes","BANANA — com letras repetidas","MATEMATICA"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat84", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
