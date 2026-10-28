/**
 * .mat109 — Velocidade final quando dois corpos se juntam
 *
 * 💥 Colisão com os corpos grudados. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "colisaoinelastica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "colisaoinelastica"

module.exports = {
    name: "mat109",
    aliases: ["cmd_mat109","alt_mat109","atalho_mat109"],
    category: "escola",
    subcategory: "Física",
    description: "Velocidade final quando dois corpos se juntam",
    usage: "<massa 1> <velocidade 1> <massa 2> <velocidade 2>",
    examples: ["1000 20 1500 0 — carro batendo em outro parado","2 5 3 -2 — batendo de frente","60 4 40 0"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat109", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
