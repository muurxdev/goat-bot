/**
 * .mat143 — Diagrama de Pauling elemento por elemento
 *
 * 🔬 Distribuição eletrônica. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "distribuicao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "distribuicao"

module.exports = {
    name: "mat143",
    aliases: ["cmd_mat143","alt_mat143","atalho_mat143"],
    category: "escola",
    subcategory: "Química",
    description: "Diagrama de Pauling elemento por elemento",
    usage: "<elemento ou número de elétrons>",
    examples: ["Fe — ferro, 26 elétrons","oxigenio","20 — cálcio"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat143", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
