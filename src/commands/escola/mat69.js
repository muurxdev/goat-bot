/**
 * .mat69 — Acha um lado com dois ângulos e um lado
 *
 * 🔺 Lei dos senos. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "leisenos" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "leisenos"

module.exports = {
    name: "mat69",
    aliases: ["cmd_mat69","alt_mat69","atalho_mat69"],
    category: "escola",
    subcategory: "Matemática",
    description: "Acha um lado com dois ângulos e um lado",
    usage: "<lado a> <ângulo A> <ângulo B>",
    examples: ["10 30 45 — lado 10 oposto a 30 graus","8 60 40","15 25 100"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat69", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
