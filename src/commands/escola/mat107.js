/**
 * .mat107 — Quanto a balança marca num elevador acelerando
 *
 * 🛗 Peso aparente no elevador. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "elevador" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "elevador"

module.exports = {
    name: "mat107",
    aliases: ["cmd_mat107","alt_mat107","atalho_mat107"],
    category: "escola",
    subcategory: "Física",
    description: "Quanto a balança marca num elevador acelerando",
    usage: "<massa em kg> <aceleração do elevador>",
    examples: ["70 2 — subindo acelerando a 2 m/s²","70 -2 — descendo acelerando","80 0 — parado ou em velocidade constante"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat107", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
