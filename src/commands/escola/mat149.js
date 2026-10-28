/**
 * .mat149 — Soma as massas atômicas da fórmula que você mandar
 *
 * 🧪 Massa molar de uma substância. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "massamolar" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "massamolar"

module.exports = {
    name: "mat149",
    aliases: ["cmd_mat149","alt_mat149","atalho_mat149"],
    category: "escola",
    subcategory: "Química",
    description: "Soma as massas atômicas da fórmula que você mandar",
    usage: "<fórmula química>",
    examples: ["H2SO4 — ácido sulfúrico","Ca(OH)2 — com parênteses","CuSO4.5H2O — com água de hidratação"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat149", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
