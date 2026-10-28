/**
 * .mat167 — pH pela concentração de um ácido forte
 *
 * 🍋 pH de um ácido forte. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "phacidoforte" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "phacidoforte"

module.exports = {
    name: "mat167",
    aliases: ["cmd_mat167","alt_mat167","atalho_mat167"],
    category: "escola",
    subcategory: "Química",
    description: "pH pela concentração de um ácido forte",
    usage: "<concentração em mol/L> [nº de hidrogênios]",
    examples: ["0,01 — HCl a 0,01 mol/L","0,05 2 — ácido sulfúrico","0,1"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat167", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
