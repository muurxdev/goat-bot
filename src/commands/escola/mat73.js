/**
 * .mat73 — O ponto bem no meio de dois pontos dados
 *
 * 🎯 Ponto médio. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "pontomedio" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "pontomedio"

module.exports = {
    name: "mat73",
    aliases: ["cmd_mat73","alt_mat73","atalho_mat73"],
    category: "escola",
    subcategory: "Matemática",
    description: "O ponto bem no meio de dois pontos dados",
    usage: "<x1> <y1> <x2> <y2>",
    examples: ["0 0 4 6 — meio do caminho","2 3 8 9","-5 1 5 -1"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat73", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
