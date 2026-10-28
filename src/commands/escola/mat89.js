/**
 * .mat89 — Chance de k acertos em n tentativas
 *
 * 🎯 Probabilidade binomial. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "probbinomial" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "probbinomial"

module.exports = {
    name: "mat89",
    aliases: ["cmd_mat89","alt_mat89","atalho_mat89"],
    category: "escola",
    subcategory: "Matemática",
    description: "Chance de k acertos em n tentativas",
    usage: "<tentativas> <chance % por tentativa> <acertos desejados>",
    examples: ["10 50 5 — cinco caras em dez lançamentos","5 20 2","8 25 3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat89", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
