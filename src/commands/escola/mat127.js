/**
 * .mat127 — Onde a imagem se forma e de que tamanho
 *
 * 🔎 Lentes: equação de Gauss. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "lentes" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "lentes"

module.exports = {
    name: "mat127",
    aliases: ["cmd_mat127","alt_mat127","atalho_mat127"],
    category: "escola",
    subcategory: "Física",
    description: "Onde a imagem se forma e de que tamanho",
    usage: "<distância do objeto> <distância focal>",
    examples: ["30 10 — objeto a 30 cm de uma lente de foco 10","5 10 — objeto dentro do foco","100 50"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat127", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
