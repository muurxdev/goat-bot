/**
 * .mat97 — Tempo de queda e velocidade ao chegar no chão
 *
 * 🪂 Queda livre. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "quedalivre" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "quedalivre"

module.exports = {
    name: "mat97",
    aliases: ["cmd_mat97","alt_mat97","atalho_mat97"],
    category: "escola",
    subcategory: "Física",
    description: "Tempo de queda e velocidade ao chegar no chão",
    usage: "<altura em metros>",
    examples: ["20 — prédio de 7 andares","1,5 — da altura da mão","100"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat97", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
