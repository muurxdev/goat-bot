/**
 * .mat145 — Conta as partículas de um átomo ou de um íon
 *
 * ⚛️ Prótons, nêutrons e elétrons. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "particulas" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "particulas"

module.exports = {
    name: "mat145",
    aliases: ["cmd_mat145","alt_mat145","atalho_mat145"],
    category: "escola",
    subcategory: "Química",
    description: "Conta as partículas de um átomo ou de um íon",
    usage: "<elemento> [número de massa] [carga]",
    examples: ["Na — sódio neutro","Na 23 1 — o cátion sódio","C 14 — o carbono-14"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat145", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
