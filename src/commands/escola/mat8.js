/**
 * .mat8 — Se A vale B, quanto vale C? Com as contas
 *
 * ⚖️ Regra de três simples. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "regratres" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "regratres"

module.exports = {
    name: "mat8",
    aliases: ["cmd_mat8","alt_mat8","atalho_mat8"],
    category: "escola",
    subcategory: "Matemática",
    description: "Se A vale B, quanto vale C? Com as contas",
    usage: "<a> <b> <c>",
    examples: ["3 12 7 — 3 pães custam 12, e 7 pães?","2 350 5 — 2 horas rendem 350, e 5 horas?","100 7 250 — receita para 100 g em 250 g"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat8", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
