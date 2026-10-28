/**
 * .mat168 — Diz se é ácido, base, sal ou óxido
 *
 * 🏷️ Função inorgânica da fórmula. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "classificafuncao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "classificafuncao"

module.exports = {
    name: "mat168",
    aliases: ["cmd_mat168","alt_mat168","atalho_mat168"],
    category: "escola",
    subcategory: "Química",
    description: "Diz se é ácido, base, sal ou óxido",
    usage: "<fórmula>",
    examples: ["H2SO4 — ácido sulfúrico","NaOH — soda cáustica","CaCO3 — calcário"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat168", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
