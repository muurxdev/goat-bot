/**
 * .mat166 — Converte entre pH e pOH (a soma dá 14)
 *
 * 🔄 pH e pOH. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "poh" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "poh"

module.exports = {
    name: "mat166",
    aliases: ["cmd_mat166","alt_mat166","atalho_mat166"],
    category: "escola",
    subcategory: "Química",
    description: "Converte entre pH e pOH (a soma dá 14)",
    usage: "<valor> [poh]",
    examples: ["4 — pH 4 vira pOH quanto","9 poh — informando o pOH","7"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat166", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
