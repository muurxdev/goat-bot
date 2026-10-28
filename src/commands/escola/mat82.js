/**
 * .mat82 — Soma os termos de uma PG, finita ou infinita
 *
 * 📦 PG: soma dos termos. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "pgsoma" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "pgsoma"

module.exports = {
    name: "mat82",
    aliases: ["cmd_mat82","alt_mat82","atalho_mat82"],
    category: "escola",
    subcategory: "Matemática",
    description: "Soma os termos de uma PG, finita ou infinita",
    usage: "<primeiro termo> <razão> <quantidade>",
    examples: ["1 2 10 — soma dos dez primeiros","3 0,5 8 — razão menor que 1","1 2 64 — o tabuleiro de xadrez inteiro"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat82", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
