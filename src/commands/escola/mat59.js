/**
 * .mat59 — Volume, área total e diagonal pela aresta
 *
 * 🧊 Cubo: volume e área total. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "volumecubo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "volumecubo"

module.exports = {
    name: "mat59",
    aliases: ["cmd_mat59","alt_mat59","atalho_mat59"],
    category: "escola",
    subcategory: "Matemática",
    description: "Volume, área total e diagonal pela aresta",
    usage: "<aresta>",
    examples: ["3 — cubo de aresta 3","0,5","10"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat59", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
