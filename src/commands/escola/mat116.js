/**
 * .mat116 — Densidade em g/cm³ e se o corpo boia na água
 *
 * 🪨 Densidade. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "densidade" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "densidade"

module.exports = {
    name: "mat116",
    aliases: ["cmd_mat116","alt_mat116","atalho_mat116"],
    category: "escola",
    subcategory: "Física",
    description: "Densidade em g/cm³ e se o corpo boia na água",
    usage: "<massa em g> <volume em cm³>",
    examples: ["200 100 — 200 g em 100 cm³","27 10 — alumínio","19,3 1 — ouro puro"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat116", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
