/**
 * .mat74 — Monta a equação da reta que passa nos pontos
 *
 * 📈 Equação da reta por dois pontos. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "equacaoreta" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "equacaoreta"

module.exports = {
    name: "mat74",
    aliases: ["cmd_mat74","alt_mat74","atalho_mat74"],
    category: "escola",
    subcategory: "Matemática",
    description: "Monta a equação da reta que passa nos pontos",
    usage: "<x1> <y1> <x2> <y2>",
    examples: ["0 1 2 5 — reta pelos pontos (0,1) e (2,5)","1 3 4 9","-1 2 3 2"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat74", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
