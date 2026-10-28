/**
 * .mat37 — Nota necessária para fechar a média que falta
 *
 * 📝 Quanto preciso tirar na prova. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "notafinal" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "notafinal"

module.exports = {
    name: "mat37",
    aliases: ["cmd_mat37","alt_mat37","atalho_mat37"],
    category: "escola",
    subcategory: "Matemática",
    description: "Nota necessária para fechar a média que falta",
    usage: "<média desejada> <nota> <nota> ...",
    examples: ["6 4,5 7 — preciso de 6 e já tirei 4,5 e 7","7 5 8 6","6 3"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat37", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
