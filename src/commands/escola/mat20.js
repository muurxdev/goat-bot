/**
 * .mat20 — Quantos períodos até o valor dobrar nos juros
 *
 * ⏳ Tempo para o dinheiro dobrar. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "tempodobrar" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "tempodobrar"

module.exports = {
    name: "mat20",
    aliases: ["cmd_mat20","alt_mat20","atalho_mat20"],
    category: "escola",
    subcategory: "Matemática",
    description: "Quantos períodos até o valor dobrar nos juros",
    usage: "<taxa % por período>",
    examples: ["1 — 1% ao mês","0,5 — poupança","12 — 12% ao ano"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat20", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
