/**
 * .mat164 — Calcula o pH e diz se é ácido ou básico
 *
 * 🧴 pH pela concentração de H+. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "ph" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "ph"

module.exports = {
    name: "mat164",
    aliases: ["cmd_mat164","alt_mat164","atalho_mat164"],
    category: "escola",
    subcategory: "Química",
    description: "Calcula o pH e diz se é ácido ou básico",
    usage: "<concentração de H+ em mol/L>",
    examples: ["0,001 — solução ácida","1e-7 — água pura","0,0000000001"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat164", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
