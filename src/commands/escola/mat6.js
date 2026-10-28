/**
 * .mat6 — Calcula f(x), a raiz e se a reta sobe ou desce
 *
 * 📈 Função do 1º grau. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "funcao1grau" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "funcao1grau"

module.exports = {
    name: "mat6",
    aliases: ["cmd_mat6","alt_mat6","atalho_mat6"],
    category: "escola",
    subcategory: "Matemática",
    description: "Calcula f(x), a raiz e se a reta sobe ou desce",
    usage: "<a> <b> <x>",
    examples: ["2 -3 5 — f(x) = 2x - 3 no ponto x = 5","-1 4 2 — reta descendo","0,5 1 10 — coeficiente com vírgula"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat6", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
