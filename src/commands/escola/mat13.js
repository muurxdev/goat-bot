/**
 * .mat13 — Calcula quanto é X% de um valor
 *
 * 💯 Porcentagem de um valor. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "porcentagemde" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "porcentagemde"

module.exports = {
    name: "mat13",
    aliases: ["cmd_mat13","alt_mat13","atalho_mat13"],
    category: "escola",
    subcategory: "Matemática",
    description: "Calcula quanto é X% de um valor",
    usage: "<porcentagem> <valor>",
    examples: ["15 200 — quanto é 15% de 200","7,5 1250 — com vírgula","120 80 — porcentagem maior que 100"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat13", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
