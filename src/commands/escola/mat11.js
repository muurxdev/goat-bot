/**
 * .mat11 — Simplifica a razão ou confere se a proporção vale
 *
 * ➗ Razão e proporção. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "razaoproporcao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "razaoproporcao"

module.exports = {
    name: "mat11",
    aliases: ["cmd_mat11","alt_mat11","atalho_mat11"],
    category: "escola",
    subcategory: "Matemática",
    description: "Simplifica a razão ou confere se a proporção vale",
    usage: "<a> <b> [c] [d]",
    examples: ["12 18 — simplifica a razão","3 4 9 12 — confere se a proporção é verdadeira","2 5 8 20"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat11", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
