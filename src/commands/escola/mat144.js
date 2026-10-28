/**
 * .mat144 — Quantos elétrons faltam ou sobram para ligar
 *
 * 🤝 Elétrons de valência. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "valencia" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "valencia"

module.exports = {
    name: "mat144",
    aliases: ["cmd_mat144","alt_mat144","atalho_mat144"],
    category: "escola",
    subcategory: "Química",
    description: "Quantos elétrons faltam ou sobram para ligar",
    usage: "<elemento>",
    examples: ["O — oxigênio","sodio","Cl"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat144", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
