/**
 * .mat169 — Iônica ou covalente pela eletronegatividade
 *
 * 🔗 Tipo de ligação química. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "tipoligacao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "tipoligacao"

module.exports = {
    name: "mat169",
    aliases: ["cmd_mat169","alt_mat169","atalho_mat169"],
    category: "escola",
    subcategory: "Química",
    description: "Iônica ou covalente pela eletronegatividade",
    usage: "<elemento 1> <elemento 2>",
    examples: ["Na Cl — o sal de cozinha","H O — a água","C C"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat169", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
