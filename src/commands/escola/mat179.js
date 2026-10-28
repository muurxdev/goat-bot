/**
 * .mat179 — Grupo característico, sufixo e exemplos reais
 *
 * 🧬 Funções orgânicas. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "funcaoorganica" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "funcaoorganica"

module.exports = {
    name: "mat179",
    aliases: ["cmd_mat179","alt_mat179","atalho_mat179"],
    category: "escola",
    subcategory: "Química",
    description: "Grupo característico, sufixo e exemplos reais",
    usage: "<nome da função>",
    examples: ["alcool — a função do etanol","ester — o cheiro das frutas","acido"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat179", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
