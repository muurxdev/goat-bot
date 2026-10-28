/**
 * .mat175 — Volume final ao mudar a temperatura do gás
 *
 * 🌡️ Lei de Charles (pressão fixa). Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "charles" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "charles"

module.exports = {
    name: "mat175",
    aliases: ["cmd_mat175","alt_mat175","atalho_mat175"],
    category: "escola",
    subcategory: "Química",
    description: "Volume final ao mudar a temperatura do gás",
    usage: "<volume 1> <temperatura 1 em °C> <temperatura 2 em °C>",
    examples: ["10 27 127 — esquentando o gás","5 0 100","2 25 -10"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat175", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
