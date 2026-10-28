/**
 * .mat130 — Converte distância focal em graus de dioptria
 *
 * 👓 Grau dos óculos (vergência). Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "vergencia" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "vergencia"

module.exports = {
    name: "mat130",
    aliases: ["cmd_mat130","alt_mat130","atalho_mat130"],
    category: "escola",
    subcategory: "Física",
    description: "Converte distância focal em graus de dioptria",
    usage: "<distância focal em metros>",
    examples: ["0,5 — foco de meio metro","-0,25 — lente divergente","2"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat130", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
