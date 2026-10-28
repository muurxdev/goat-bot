/**
 * .mat81 — Acha o enésimo termo de uma progressão geométrica
 *
 * ✖️ PG: termo geral. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "pg" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "pg"

module.exports = {
    name: "mat81",
    aliases: ["cmd_mat81","alt_mat81","atalho_mat81"],
    category: "escola",
    subcategory: "Matemática",
    description: "Acha o enésimo termo de uma progressão geométrica",
    usage: "<primeiro termo> <razão> <posição>",
    examples: ["2 3 8 — dobra e triplica rápido","1 2 20 — o grão de arroz do tabuleiro","1000 0,5 10"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat81", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
