/**
 * .mat44 — Calcula a raiz e simplifica o radical
 *
 * √ Raiz quadrada. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "raiz" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "raiz"

module.exports = {
    name: "mat44",
    aliases: ["cmd_mat44","alt_mat44","atalho_mat44"],
    category: "escola",
    subcategory: "Matemática",
    description: "Calcula a raiz e simplifica o radical",
    usage: "<número>",
    examples: ["144 — raiz exata","72 — vira 6 raiz de 2","2 — número irracional"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat44", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
