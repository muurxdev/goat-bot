/**
 * .mat176 — Volume final mudando pressão e temperatura
 *
 * 🔀 Equação geral dos gases. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "equacaogeralgases" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "equacaogeralgases"

module.exports = {
    name: "mat176",
    aliases: ["cmd_mat176","alt_mat176","atalho_mat176"],
    category: "escola",
    subcategory: "Química",
    description: "Volume final mudando pressão e temperatura",
    usage: "<P1> <V1> <T1 °C> <P2> <T2 °C>",
    examples: ["1 10 27 2 127 — mudando tudo de uma vez","2 5 0 1 100","1 22,4 0 1,5 50"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat176", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
