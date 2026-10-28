/**
 * .mat77 — Converte binário somando os valores posicionais
 *
 * 🔤 Binário para decimal. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "bindec" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "bindec"

module.exports = {
    name: "mat77",
    aliases: ["cmd_mat77","alt_mat77","atalho_mat77"],
    category: "escola",
    subcategory: "Matemática",
    description: "Converte binário somando os valores posicionais",
    usage: "<número binário>",
    examples: ["101010 — vira 42","11111111","1101"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat77", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
