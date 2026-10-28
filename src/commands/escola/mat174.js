/**
 * .mat174 — Volume final ao mudar a pressão do gás
 *
 * 🗜️ Lei de Boyle (temperatura fixa). Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "boyle" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "boyle"

module.exports = {
    name: "mat174",
    aliases: ["cmd_mat174","alt_mat174","atalho_mat174"],
    category: "escola",
    subcategory: "Química",
    description: "Volume final ao mudar a pressão do gás",
    usage: "<pressão 1> <volume 1> <pressão 2>",
    examples: ["1 10 2 — dobrando a pressão","2 5 0,5","1 100 4"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat174", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
