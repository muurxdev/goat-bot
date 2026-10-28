/**
 * .mat5 — Resolve o sistema de x e y e mostra as contas
 *
 * 🔗 Sistema de duas equações. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "sistema2x2" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "sistema2x2"

module.exports = {
    name: "mat5",
    aliases: ["cmd_mat5","alt_mat5","atalho_mat5"],
    category: "escola",
    subcategory: "Matemática",
    description: "Resolve o sistema de x e y e mostra as contas",
    usage: "<eq 1> ; <eq 2>",
    examples: ["2x + 3y = 8 ; x - y = 1 — clássico do caderno","x + y = 10 ; x - y = 4 — soma e diferença","3x + 2y = 12 ; x + y = 5"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat5", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
