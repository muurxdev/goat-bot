/**
 * .mat111 — Energia guardada no movimento de um corpo
 *
 * 🏃 Energia cinética. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "energiacinetica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "energiacinetica"

module.exports = {
    name: "mat111",
    aliases: ["cmd_mat111","alt_mat111","atalho_mat111"],
    category: "escola",
    subcategory: "Física",
    description: "Energia guardada no movimento de um corpo",
    usage: "<massa em kg> <velocidade em m/s>",
    examples: ["1000 20 — carro de 1 t a 72 km/h","70 8 — pessoa correndo","0,05 300 — projétil"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat111", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
