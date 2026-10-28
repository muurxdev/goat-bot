/**
 * .mat76 — Converte para binário mostrando as divisões
 *
 * 💻 Decimal para binário. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "decbin" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "decbin"

module.exports = {
    name: "mat76",
    aliases: ["cmd_mat76","alt_mat76","atalho_mat76"],
    category: "escola",
    subcategory: "Matemática",
    description: "Converte para binário mostrando as divisões",
    usage: "<número decimal>",
    examples: ["42 — o número da resposta","255","13"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat76", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
