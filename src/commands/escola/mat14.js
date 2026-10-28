/**
 * .mat14 — Descobre a porcentagem que um valor representa
 *
 * 📊 Quanto por cento A é de B. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "percentualquanto" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "percentualquanto"

module.exports = {
    name: "mat14",
    aliases: ["cmd_mat14","alt_mat14","atalho_mat14"],
    category: "escola",
    subcategory: "Matemática",
    description: "Descobre a porcentagem que um valor representa",
    usage: "<parte> <total>",
    examples: ["30 200 — 30 é quantos por cento de 200","7 9 — acertos numa prova de 9","1250 5000"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat14", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
