/**
 * .mat46 — Log em qualquer base, com a leitura do resultado
 *
 * 📐 Logaritmo. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "logaritmo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "logaritmo"

module.exports = {
    name: "mat46",
    aliases: ["cmd_mat46","alt_mat46","atalho_mat46"],
    category: "escola",
    subcategory: "Matemática",
    description: "Log em qualquer base, com a leitura do resultado",
    usage: "<número> [base]",
    examples: ["1000 10 — log de 1000 na base 10","8 2 — log de 8 na base 2","100 — base 10 é o padrão"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat46", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
