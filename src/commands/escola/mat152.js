/**
 * .mat152 — Converte mols em número de moléculas
 *
 * 🔢 Número de partículas. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "avogadro" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "avogadro"

module.exports = {
    name: "mat152",
    aliases: ["cmd_mat152","alt_mat152","atalho_mat152"],
    category: "escola",
    subcategory: "Química",
    description: "Converte mols em número de moléculas",
    usage: "<mols> [fórmula]",
    examples: ["2 — dois mols","0,25","18 H2O — a partir da massa em gramas"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat152", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
