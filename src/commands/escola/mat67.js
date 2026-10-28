/**
 * .mat67 — As três razões de um ângulo em graus
 *
 * 🌀 Seno, cosseno e tangente. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "trigangulo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "trigangulo"

module.exports = {
    name: "mat67",
    aliases: ["cmd_mat67","alt_mat67","atalho_mat67"],
    category: "escola",
    subcategory: "Matemática",
    description: "As três razões de um ângulo em graus",
    usage: "<ângulo em graus>",
    examples: ["30 — ângulo notável","45","60"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat67", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
