/**
 * .mat36 — Mede o quanto os valores se espalham da média
 *
 * 📏 Desvio padrão e variância. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "desviopadrao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "desviopadrao"

module.exports = {
    name: "mat36",
    aliases: ["cmd_mat36","alt_mat36","atalho_mat36"],
    category: "escola",
    subcategory: "Matemática",
    description: "Mede o quanto os valores se espalham da média",
    usage: "<número> <número> [mais números]",
    examples: ["2 4 4 4 5 5 7 9 — exemplo clássico","10 12 23 23 16 23 21 16","5 5 5 5 — sem variação"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat36", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
