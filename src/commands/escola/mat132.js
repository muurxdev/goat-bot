/**
 * .mat132 — Um é o inverso do outro; eu converto os dois
 *
 * ⏱️ Período e frequência. Matéria: Física.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "periodofrequencia" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "periodofrequencia"

module.exports = {
    name: "mat132",
    aliases: ["cmd_mat132","alt_mat132","atalho_mat132"],
    category: "escola",
    subcategory: "Física",
    description: "Um é o inverso do outro; eu converto os dois",
    usage: "<valor> <hz|s>",
    examples: ["60 hz — frequência da tomada no Brasil","0,02 s — período de 20 milissegundos","440 hz"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat132", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
