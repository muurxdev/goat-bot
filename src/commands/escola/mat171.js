/**
 * .mat171 — Se a molécula é polar e no que ela dissolve
 *
 * 🧲 Polaridade e solubilidade. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "polaridade" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "polaridade"

module.exports = {
    name: "mat171",
    aliases: ["cmd_mat171","alt_mat171","atalho_mat171"],
    category: "escola",
    subcategory: "Química",
    description: "Se a molécula é polar e no que ela dissolve",
    usage: "<fórmula da molécula>",
    examples: ["CO2 — apolar apesar das ligações polares","H2O","CCl4"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat171", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
