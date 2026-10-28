/**
 * .mat29 — Lista os números primos de 2 até o limite
 *
 * 📜 Primos até um número. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "primosate" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "primosate"

module.exports = {
    name: "mat29",
    aliases: ["cmd_mat29","alt_mat29","atalho_mat29"],
    category: "escola",
    subcategory: "Matemática",
    description: "Lista os números primos de 2 até o limite",
    usage: "<limite>",
    examples: ["50 — os quinze primeiros","100","30"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat29", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
