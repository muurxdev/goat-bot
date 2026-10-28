/**
 * .mat100 — Período, frequência e velocidade numa volta
 *
 * 🎡 Movimento circular. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "mcu" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "mcu"

module.exports = {
    name: "mat100",
    aliases: ["cmd_mat100","alt_mat100","atalho_mat100"],
    category: "escola",
    subcategory: "Física",
    description: "Período, frequência e velocidade numa volta",
    usage: "<raio em metros> <período em segundos>",
    examples: ["2 4 — roda de raio 2 m girando a cada 4 s","0,33 0,5 — roda de bicicleta","6371000 86400 — a Terra girando"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat100", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
