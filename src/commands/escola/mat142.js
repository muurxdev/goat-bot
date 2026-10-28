/**
 * .mat142 — Quem são e o que têm em comum os elementos
 *
 * 👨‍👩‍👧 Famílias da tabela periódica. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "familia" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "familia"

module.exports = {
    name: "mat142",
    aliases: ["cmd_mat142","alt_mat142","atalho_mat142"],
    category: "escola",
    subcategory: "Química",
    description: "Quem são e o que têm em comum os elementos",
    usage: "<nome da família>",
    examples: ["halogenios — a família do cloro","gases nobres","alcalinos"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat142", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
