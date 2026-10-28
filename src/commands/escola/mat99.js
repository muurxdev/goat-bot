/**
 * .mat99 — Alcance e altura de um chute ou arremesso
 *
 * ⚽ Lançamento oblíquo. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "lancobliquo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "lancobliquo"

module.exports = {
    name: "mat99",
    aliases: ["cmd_mat99","alt_mat99","atalho_mat99"],
    category: "escola",
    subcategory: "Física",
    description: "Alcance e altura de um chute ou arremesso",
    usage: "<velocidade em m/s> <ângulo em graus>",
    examples: ["20 45 — o ângulo de maior alcance","15 30","25 60"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat99", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
