/**
 * .mat155 — Descobre a proporção dos átomos por análise
 *
 * 🧩 Fórmula mínima pelos percentuais. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "formulaminima" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "formulaminima"

module.exports = {
    name: "mat155",
    aliases: ["cmd_mat155","alt_mat155","atalho_mat155"],
    category: "escola",
    subcategory: "Química",
    description: "Descobre a proporção dos átomos por análise",
    usage: "<elemento> <%> <elemento> <%> ...",
    examples: ["C 40 H 6,7 O 53,3 — vira CH2O","Na 39,3 Cl 60,7","Fe 69,9 O 30,1"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat155", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
