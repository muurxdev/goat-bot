/**
 * .mat21 — Converte taxa de juros entre mês e ano
 *
 * 🔁 Taxa mensal e taxa anual. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "taxaequivalente" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "taxaequivalente"

module.exports = {
    name: "mat21",
    aliases: ["cmd_mat21","alt_mat21","atalho_mat21"],
    category: "escola",
    subcategory: "Matemática",
    description: "Converte taxa de juros entre mês e ano",
    usage: "<taxa %> [ano]",
    examples: ["1 — 1% ao mês vira quanto ao ano","12 ano — 12% ao ano vira quanto ao mês","0,5"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat21", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
