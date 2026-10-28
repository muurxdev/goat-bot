/**
 * .mat134 — Potência em watts pela tensão e corrente
 *
 * 💡 Potência elétrica. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "potenciaeletrica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "potenciaeletrica"

module.exports = {
    name: "mat134",
    aliases: ["cmd_mat134","alt_mat134","atalho_mat134"],
    category: "escola",
    subcategory: "Física",
    description: "Potência em watts pela tensão e corrente",
    usage: "<tensão em V> <corrente em A>",
    examples: ["127 45 — chuveiro elétrico","220 5","12 2"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat134", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
