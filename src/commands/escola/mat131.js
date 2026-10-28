/**
 * .mat131 — Velocidade pelo comprimento de onda e frequência
 *
 * 🌊 Velocidade de uma onda. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "ondavelocidade" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "ondavelocidade"

module.exports = {
    name: "mat131",
    aliases: ["cmd_mat131","alt_mat131","atalho_mat131"],
    category: "escola",
    subcategory: "Física",
    description: "Velocidade pelo comprimento de onda e frequência",
    usage: "<comprimento de onda em m> <frequência em Hz>",
    examples: ["0,5 680 — som no ar","3 100","0,000000550 545000000000000 — luz verde"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat131", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
