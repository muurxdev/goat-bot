/**
 * .mat54 — Área do trapézio com as duas bases e a altura
 *
 * 🪁 Trapézio: área. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "areatrapezio" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "areatrapezio"

module.exports = {
    name: "mat54",
    aliases: ["cmd_mat54","alt_mat54","atalho_mat54"],
    category: "escola",
    subcategory: "Matemática",
    description: "Área do trapézio com as duas bases e a altura",
    usage: "<base maior> <base menor> <altura>",
    examples: ["10 6 4 — bases 10 e 6, altura 4","8 3 5","12,5 7,5 6"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat54", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
