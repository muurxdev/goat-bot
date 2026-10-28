/**
 * .mat16 — Tira X% do preço e mostra quanto você economiza
 *
 * 🏷️ Desconto em um preço. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "descontar" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "descontar"

module.exports = {
    name: "mat16",
    aliases: ["cmd_mat16","alt_mat16","atalho_mat16"],
    category: "escola",
    subcategory: "Matemática",
    description: "Tira X% do preço e mostra quanto você economiza",
    usage: "<preço> <porcentagem de desconto>",
    examples: ["200 15 — 15% de desconto em 200","1299,90 30 — liquidação","49,90 5"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat16", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
