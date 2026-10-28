/**
 * .mat56 — Quanto de cerca ou rodapé dá a volta na área
 *
 * 🧵 Perímetro do retângulo. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "perimetroretangulo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "perimetroretangulo"

module.exports = {
    name: "mat56",
    aliases: ["cmd_mat56","alt_mat56","atalho_mat56"],
    category: "escola",
    subcategory: "Matemática",
    description: "Quanto de cerca ou rodapé dá a volta na área",
    usage: "<base> <altura>",
    examples: ["8 5 — cômodo de 8 por 5","30 20 — terreno","4,5 3,2"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat56", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
