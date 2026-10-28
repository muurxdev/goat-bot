/**
 * .mat104 — Atrito a partir do coeficiente e da massa
 *
 * 🧱 Força de atrito. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "atrito" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "atrito"

module.exports = {
    name: "mat104",
    aliases: ["cmd_mat104","alt_mat104","atalho_mat104"],
    category: "escola",
    subcategory: "Física",
    description: "Atrito a partir do coeficiente e da massa",
    usage: "<coeficiente de atrito> <massa em kg>",
    examples: ["0,3 50 — caixa de 50 kg no chão","0,8 1000 — pneu no asfalto seco","0,1 20 — superfície escorregadia"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat104", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
