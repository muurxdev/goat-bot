/**
 * .mat35 — O valor que mais se repete na lista
 *
 * 👑 Moda. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "moda" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "moda"

module.exports = {
    name: "mat35",
    aliases: ["cmd_mat35","alt_mat35","atalho_mat35"],
    category: "escola",
    subcategory: "Matemática",
    description: "O valor que mais se repete na lista",
    usage: "<número> <número> [mais números]",
    examples: ["3 7 3 9 3 — o 3 domina","1 1 2 2 5 — duas modas","4 5 6 — nenhuma repetição"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat35", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
