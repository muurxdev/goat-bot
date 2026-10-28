/**
 * .mat157 — Gramas de soluto por litro de solução
 *
 * 🥤 Concentração comum (g/L). Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "concentracaocomum" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "concentracaocomum"

module.exports = {
    name: "mat157",
    aliases: ["cmd_mat157","alt_mat157","atalho_mat157"],
    category: "escola",
    subcategory: "Química",
    description: "Gramas de soluto por litro de solução",
    usage: "<massa do soluto em g> <volume em litros>",
    examples: ["20 0,5 — 20 g em meio litro","5 2","58,5 1"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat157", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
