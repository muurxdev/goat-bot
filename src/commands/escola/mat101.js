/**
 * .mat101 — A aceleração que empurra para o centro da curva
 *
 * 🌀 Aceleração centrípeta. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "acentripeta" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "acentripeta"

module.exports = {
    name: "mat101",
    aliases: ["cmd_mat101","alt_mat101","atalho_mat101"],
    category: "escola",
    subcategory: "Física",
    description: "A aceleração que empurra para o centro da curva",
    usage: "<velocidade em m/s> <raio da curva>",
    examples: ["20 50 — carro a 72 km/h numa curva de 50 m","10 5","30 100"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat101", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
