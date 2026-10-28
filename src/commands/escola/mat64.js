/**
 * .mat64 — Volume e apótema de uma pirâmide quadrada
 *
 * 🏛️ Pirâmide de base quadrada. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "volumepiramide" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "volumepiramide"

module.exports = {
    name: "mat64",
    aliases: ["cmd_mat64","alt_mat64","atalho_mat64"],
    category: "escola",
    subcategory: "Matemática",
    description: "Volume e apótema de uma pirâmide quadrada",
    usage: "<lado da base> <altura>",
    examples: ["230 146 — a pirâmide de Quéops em metros","6 4","10 12"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat64", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
