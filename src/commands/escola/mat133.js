/**
 * .mat133 — Corrente a partir da tensão e da resistência
 *
 * 🔌 Primeira lei de Ohm. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "ohm" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "ohm"

module.exports = {
    name: "mat133",
    aliases: ["cmd_mat133","alt_mat133","atalho_mat133"],
    category: "escola",
    subcategory: "Física",
    description: "Corrente a partir da tensão e da resistência",
    usage: "<tensão em V> <resistência em ohms>",
    examples: ["127 10 — tomada de 127 V num resistor de 10 ohms","220 44","12 6 — circuito de carro"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat133", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
