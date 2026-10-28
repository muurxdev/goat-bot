/**
 * .mat110 — Energia gasta ao empurrar algo por uma distância
 *
 * 🏋️ Trabalho de uma força. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "trabalho" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "trabalho"

module.exports = {
    name: "mat110",
    aliases: ["cmd_mat110","alt_mat110","atalho_mat110"],
    category: "escola",
    subcategory: "Física",
    description: "Energia gasta ao empurrar algo por uma distância",
    usage: "<força em N> <distância em m> [ângulo]",
    examples: ["50 10 — empurrando com 50 N por 10 m","100 5 60 — força inclinada 60 graus","20 3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat110", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
