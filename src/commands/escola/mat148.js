/**
 * .mat148 — Raio, eletronegatividade e caráter metálico
 *
 * 📊 Comparar dois elementos. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "propriedadesperiodicas" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "propriedadesperiodicas"

module.exports = {
    name: "mat148",
    aliases: ["cmd_mat148","alt_mat148","atalho_mat148"],
    category: "escola",
    subcategory: "Química",
    description: "Raio, eletronegatividade e caráter metálico",
    usage: "<elemento 1> <elemento 2>",
    examples: ["Na Cl — sódio e cloro","Li Cs","F I"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat148", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
