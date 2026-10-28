/**
 * .mat15 — Aplica um aumento e mostra o valor novo
 *
 * 📈 Aumentar um valor em X%. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "aumentar" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "aumentar"

module.exports = {
    name: "mat15",
    aliases: ["cmd_mat15","alt_mat15","atalho_mat15"],
    category: "escola",
    subcategory: "Matemática",
    description: "Aplica um aumento e mostra o valor novo",
    usage: "<valor> <porcentagem de aumento>",
    examples: ["200 15 — aumenta 200 em 15%","1412 4,62 — reajuste do salário mínimo","89,90 10"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat15", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
