/**
 * .mat63 — Volume e superfície de uma bola pelo raio
 *
 * ⚽ Esfera: volume e área. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "volumeesfera" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "volumeesfera"

module.exports = {
    name: "mat63",
    aliases: ["cmd_mat63","alt_mat63","atalho_mat63"],
    category: "escola",
    subcategory: "Matemática",
    description: "Volume e superfície de uma bola pelo raio",
    usage: "<raio>",
    examples: ["0,11 — bola de futebol em metros","5","6371 — raio da Terra em km"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat63", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
