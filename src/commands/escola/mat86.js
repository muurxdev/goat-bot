/**
 * .mat86 — Quantos grupos de p entre n, sem ordem
 *
 * 🎲 Combinação: quando a ordem não importa. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "combinacao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "combinacao"

module.exports = {
    name: "mat86",
    aliases: ["cmd_mat86","alt_mat86","atalho_mat86"],
    category: "escola",
    subcategory: "Matemática",
    description: "Quantos grupos de p entre n, sem ordem",
    usage: "<n> <p>",
    examples: ["60 6 — os jogos possíveis da Mega-Sena","10 3","52 5 — mãos de pôquer"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat86", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
