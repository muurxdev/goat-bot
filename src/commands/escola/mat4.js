/**
 * .mat4 — Relações de Girard sem precisar de Bhaskara
 *
 * 🤝 Soma e produto das raízes. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "girard" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "girard"

module.exports = {
    name: "mat4",
    aliases: ["cmd_mat4","alt_mat4","atalho_mat4"],
    category: "escola",
    subcategory: "Matemática",
    description: "Relações de Girard sem precisar de Bhaskara",
    usage: "<equação ou a b c>",
    examples: ["1 -5 6 — soma 5 e produto 6","x² - 7x + 12 = 0 — dá para adivinhar as raízes","2x² - 5x + 3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat4", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
