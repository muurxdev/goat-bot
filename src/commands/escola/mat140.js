/**
 * .mat140 — As sete unidades de base e os prefixos do SI
 *
 * 📐 Unidades do Sistema Internacional. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "unidadessi" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "unidadessi"

module.exports = {
    name: "mat140",
    aliases: ["cmd_mat140","alt_mat140","atalho_mat140"],
    category: "escola",
    subcategory: "Física",
    description: "As sete unidades de base e os prefixos do SI",
    usage: "<grandeza ou \"todas\">",
    examples: ["massa — a unidade de massa","todas — as sete de base","prefixos — quilo, mili, micro"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat140", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
