/**
 * .mat105 — Forças e aceleração numa rampa sem atrito
 *
 * ⛰️ Plano inclinado. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "planoinclinado" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "planoinclinado"

module.exports = {
    name: "mat105",
    aliases: ["cmd_mat105","alt_mat105","atalho_mat105"],
    category: "escola",
    subcategory: "Física",
    description: "Forças e aceleração numa rampa sem atrito",
    usage: "<massa em kg> <ângulo da rampa>",
    examples: ["10 30 — caixa de 10 kg numa rampa de 30 graus","50 15","2 45"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat105", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
