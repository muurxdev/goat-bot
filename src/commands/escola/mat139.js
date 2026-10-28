/**
 * .mat139 — Procure uma constante pelo nome e veja o valor
 *
 * 📚 Constantes da física. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "constantesfisicas" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "constantesfisicas"

module.exports = {
    name: "mat139",
    aliases: ["cmd_mat139","alt_mat139","atalho_mat139"],
    category: "escola",
    subcategory: "Física",
    description: "Procure uma constante pelo nome e veja o valor",
    usage: "<nome da constante ou \"todas\">",
    examples: ["luz — velocidade da luz","avogadro","todas — a lista inteira"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat139", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
