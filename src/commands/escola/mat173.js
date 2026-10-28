/**
 * .mat173 — Quantos mols há num gás por P, V e T
 *
 * 🎈 Equação dos gases ideais. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "gasesideais" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "gasesideais"

module.exports = {
    name: "mat173",
    aliases: ["cmd_mat173","alt_mat173","atalho_mat173"],
    category: "escola",
    subcategory: "Química",
    description: "Quantos mols há num gás por P, V e T",
    usage: "<pressão em atm> <volume em L> <temperatura em °C>",
    examples: ["1 22,4 0 — as condições normais","2 10 27","1 5 25"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat173", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
