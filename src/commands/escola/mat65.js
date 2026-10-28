/**
 * .mat65 — Acha a hipotenusa a partir dos dois catetos
 *
 * 📏 Teorema de Pitágoras: hipotenusa. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "pitagoras" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "pitagoras"

module.exports = {
    name: "mat65",
    aliases: ["cmd_mat65","alt_mat65","atalho_mat65"],
    category: "escola",
    subcategory: "Matemática",
    description: "Acha a hipotenusa a partir dos dois catetos",
    usage: "<cateto> <cateto>",
    examples: ["3 4 — o triângulo mais famoso da escola","5 12","1,5 2"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat65", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
