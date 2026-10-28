/**
 * .mat103 — Peso em newtons e em outros mundos
 *
 * ⚖️ Peso e massa. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "peso" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "peso"

module.exports = {
    name: "mat103",
    aliases: ["cmd_mat103","alt_mat103","atalho_mat103"],
    category: "escola",
    subcategory: "Física",
    description: "Peso em newtons e em outros mundos",
    usage: "<massa em kg> [gravidade]",
    examples: ["70 — uma pessoa de 70 kg na Terra","70 1,62 — a mesma pessoa na Lua","5 3,71 — em Marte"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat103", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
