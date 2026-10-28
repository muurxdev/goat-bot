/**
 * .mat58 — Área da fatia e comprimento do arco
 *
 * 🍰 Setor circular: fatia de pizza. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "areasetor" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "areasetor"

module.exports = {
    name: "mat58",
    aliases: ["cmd_mat58","alt_mat58","atalho_mat58"],
    category: "escola",
    subcategory: "Matemática",
    description: "Área da fatia e comprimento do arco",
    usage: "<raio> <ângulo em graus>",
    examples: ["10 45 — fatia de 45 graus","6 90 — um quarto do círculo","20 120"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat58", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
