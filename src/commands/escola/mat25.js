/**
 * .mat25 — MDC de dois ou mais números, com a fatoração
 *
 * 🧷 MDC — máximo divisor comum. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "mdc" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "mdc"

module.exports = {
    name: "mat25",
    aliases: ["cmd_mat25","alt_mat25","atalho_mat25"],
    category: "escola",
    subcategory: "Matemática",
    description: "MDC de dois ou mais números, com a fatoração",
    usage: "<número> <número> [mais números]",
    examples: ["12 18 — o clássico da sala","48 60 36 — três números","35 64 — números primos entre si"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat25", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
