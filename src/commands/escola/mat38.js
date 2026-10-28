/**
 * .mat38 — Soma ou subtrai duas frações pelo MMC
 *
 * 🍕 Somar e subtrair frações. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "somarfracao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "somarfracao"

module.exports = {
    name: "mat38",
    aliases: ["cmd_mat38","alt_mat38","atalho_mat38"],
    category: "escola",
    subcategory: "Matemática",
    description: "Soma ou subtrai duas frações pelo MMC",
    usage: "<fração> + <fração>",
    examples: ["1/2 + 1/3 — soma com denominadores diferentes","3/4 - 2/5 — subtração","5/6 + 1/6 — mesmo denominador"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat38", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
