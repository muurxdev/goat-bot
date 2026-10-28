/**
 * .mat90 — Probabilidade real de acertar as seis dezenas
 *
 * 🍀 Chance na Mega-Sena. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "probmega" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "probmega"

module.exports = {
    name: "mat90",
    aliases: ["cmd_mat90","alt_mat90","atalho_mat90"],
    category: "escola",
    subcategory: "Matemática",
    description: "Probabilidade real de acertar as seis dezenas",
    usage: "<quantas dezenas você joga>",
    examples: ["6 — a aposta simples","10 — aposta com dez dezenas","15"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat90", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
