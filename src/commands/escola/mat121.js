/**
 * .mat121 — Calor necessário para mudar a temperatura
 *
 * 🔥 Calor para esquentar. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "calorsensivel" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "calorsensivel"

module.exports = {
    name: "mat121",
    aliases: ["cmd_mat121","alt_mat121","atalho_mat121"],
    category: "escola",
    subcategory: "Física",
    description: "Calor necessário para mudar a temperatura",
    usage: "<massa em g> <variação de temperatura> [material]",
    examples: ["500 60 — esquentar meio litro de água em 60 graus","200 30 aluminio","1000 80 ferro"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat121", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
