/**
 * .mat71 — Converte ângulo entre graus e radianos
 *
 * 🔄 Graus e radianos. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "grausrad" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "grausrad"

module.exports = {
    name: "mat71",
    aliases: ["cmd_mat71","alt_mat71","atalho_mat71"],
    category: "escola",
    subcategory: "Matemática",
    description: "Converte ângulo entre graus e radianos",
    usage: "<valor> [rad]",
    examples: ["180 — graus para radianos","3,1416 rad — radianos para graus","45"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat71", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
