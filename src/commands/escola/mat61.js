/**
 * .mat61 — Volume, litros e área total de um cilindro
 *
 * 🥫 Cilindro: volume e área. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "volumecilindro" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "volumecilindro"

module.exports = {
    name: "mat61",
    aliases: ["cmd_mat61","alt_mat61","atalho_mat61"],
    category: "escola",
    subcategory: "Matemática",
    description: "Volume, litros e área total de um cilindro",
    usage: "<raio> <altura>",
    examples: ["0,5 1,2 — caixa dágua em metros","3 10","0,04 0,12 — lata de refrigerante"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat61", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
