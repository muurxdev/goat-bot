/**
 * .mat122 — Calor da mudança de estado, sem mudar a temperatura
 *
 * 🧊 Calor para derreter ou ferver. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "calorlatente" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "calorlatente"

module.exports = {
    name: "mat122",
    aliases: ["cmd_mat122","alt_mat122","atalho_mat122"],
    category: "escola",
    subcategory: "Física",
    description: "Calor da mudança de estado, sem mudar a temperatura",
    usage: "<massa em g> <fusao|vaporizacao>",
    examples: ["200 fusao — derreter 200 g de gelo","500 vaporizacao — ferver meio litro","1000 fusao"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat122", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
