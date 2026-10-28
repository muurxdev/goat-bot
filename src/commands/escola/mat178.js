/**
 * .mat178 — Nome, fórmula e massa molar de um hidrocarboneto
 *
 * 🛢️ Hidrocarboneto por número de carbonos. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "hidrocarboneto" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "hidrocarboneto"

module.exports = {
    name: "mat178",
    aliases: ["cmd_mat178","alt_mat178","atalho_mat178"],
    category: "escola",
    subcategory: "Química",
    description: "Nome, fórmula e massa molar de um hidrocarboneto",
    usage: "<número de carbonos> [alcano|alceno|alcino]",
    examples: ["1 alcano — o metano","4 alcano — o butano do gás de cozinha","2 alceno — o eteno"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat178", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
