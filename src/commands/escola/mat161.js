/**
 * .mat161 — Porcentagem de soluto na massa da solução
 *
 * 📉 Título em massa (%). Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "titulomassa" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "titulomassa"

module.exports = {
    name: "mat161",
    aliases: ["cmd_mat161","alt_mat161","atalho_mat161"],
    category: "escola",
    subcategory: "Química",
    description: "Porcentagem de soluto na massa da solução",
    usage: "<massa do soluto> <massa da solução>",
    examples: ["5 100 — 5 g em 100 g de solução","20 250","3,5 1000 — a salinidade do mar"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat161", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
