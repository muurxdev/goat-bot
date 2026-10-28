/**
 * .mat85 — Quantas sequências de p entre n, com ordem
 *
 * 🥇 Arranjo: quando a ordem importa. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "arranjo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "arranjo"

module.exports = {
    name: "mat85",
    aliases: ["cmd_mat85","alt_mat85","atalho_mat85"],
    category: "escola",
    subcategory: "Matemática",
    description: "Quantas sequências de p entre n, com ordem",
    usage: "<n> <p>",
    examples: ["10 3 — pódio de 3 entre 10 corredores","5 2","26 4"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat85", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
