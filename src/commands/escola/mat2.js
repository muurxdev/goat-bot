/**
 * .mat2 — Bhaskara completa, com delta e as raízes
 *
 * 📐 Equação do 2º grau. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "eq2grau" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "eq2grau"

module.exports = {
    name: "mat2",
    aliases: ["cmd_mat2","alt_mat2","atalho_mat2"],
    category: "escola",
    subcategory: "Matemática",
    description: "Bhaskara completa, com delta e as raízes",
    usage: "<equação com x²>",
    examples: ["2x² - 5x + 3 = 0 — duas raízes","x² + 2x + 5 = 0 — delta negativo","x² - 6x + 9 = 0 — raiz dupla"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat2", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
