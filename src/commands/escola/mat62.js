/**
 * .mat62 — Volume, geratriz e área total do cone
 *
 * 🍦 Cone: volume e área. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "volumecone" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "volumecone"

module.exports = {
    name: "mat62",
    aliases: ["cmd_mat62","alt_mat62","atalho_mat62"],
    category: "escola",
    subcategory: "Matemática",
    description: "Volume, geratriz e área total do cone",
    usage: "<raio> <altura>",
    examples: ["3 4 — cone de raio 3 e altura 4","0,05 0,15 — casquinha","10 24"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat62", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
