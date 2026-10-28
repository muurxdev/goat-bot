/**
 * .mat119 — Força que a água faz para cima num corpo
 *
 * 🛟 Empuxo de Arquimedes. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "empuxo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "empuxo"

module.exports = {
    name: "mat119",
    aliases: ["cmd_mat119","alt_mat119","atalho_mat119"],
    category: "escola",
    subcategory: "Física",
    description: "Força que a água faz para cima num corpo",
    usage: "<volume submerso em litros> [densidade do líquido]",
    examples: ["10 — 10 litros submersos na água","50 — corpo maior","2 800 — em óleo de 800 kg/m³"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat119", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
