/**
 * .mat102 — Força resultante a partir da massa e aceleração
 *
 * 💪 Segunda lei de Newton. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "forcaresultante" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "forcaresultante"

module.exports = {
    name: "mat102",
    aliases: ["cmd_mat102","alt_mat102","atalho_mat102"],
    category: "escola",
    subcategory: "Física",
    description: "Força resultante a partir da massa e aceleração",
    usage: "<massa em kg> <aceleração em m/s²>",
    examples: ["1000 2 — carro de 1 tonelada acelerando","70 1,5","0,145 300 — bola de beisebol na tacada"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat102", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
