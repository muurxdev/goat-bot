/**
 * .mat153 — Volume ocupado por um gás a 0 °C e 1 atm
 *
 * 🎈 Volume de um gás na CNTP. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "volumemolar" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "volumemolar"

module.exports = {
    name: "mat153",
    aliases: ["cmd_mat153","alt_mat153","atalho_mat153"],
    category: "escola",
    subcategory: "Química",
    description: "Volume ocupado por um gás a 0 °C e 1 atm",
    usage: "<mols> [fórmula]",
    examples: ["2 — dois mols de qualquer gás","0,5","32 O2 — a partir da massa"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat153", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
