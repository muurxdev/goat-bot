/**
 * .mat47 — Escreve número grande ou pequeno em potência de 10
 *
 * 🔬 Número em notação científica. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "notacaocientifica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "notacaocientifica"

module.exports = {
    name: "mat47",
    aliases: ["cmd_mat47","alt_mat47","atalho_mat47"],
    category: "escola",
    subcategory: "Matemática",
    description: "Escreve número grande ou pequeno em potência de 10",
    usage: "<número>",
    examples: ["300000000 — velocidade da luz","0,000045","1500"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat47", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
