/**
 * .mat115 — Quanto da energia vira trabalho útil, em %
 *
 * ♻️ Rendimento de uma máquina. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "rendimento" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "rendimento"

module.exports = {
    name: "mat115",
    aliases: ["cmd_mat115","alt_mat115","atalho_mat115"],
    category: "escola",
    subcategory: "Física",
    description: "Quanto da energia vira trabalho útil, em %",
    usage: "<energia útil> <energia total gasta>",
    examples: ["300 1000 — motor que aproveita 300 de 1000","45 60","2 10"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat115", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
