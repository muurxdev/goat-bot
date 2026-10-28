/**
 * .mat60 — Volume e litros de uma caixa ou cômodo
 *
 * 📦 Caixa retangular: volume. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "volumebloco" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "volumebloco"

module.exports = {
    name: "mat60",
    aliases: ["cmd_mat60","alt_mat60","atalho_mat60"],
    category: "escola",
    subcategory: "Matemática",
    description: "Volume e litros de uma caixa ou cômodo",
    usage: "<comprimento> <largura> <altura>",
    examples: ["2 1,5 1 — caixa dágua em metros","0,4 0,3 0,25 — caixa de papelão","5 4 2,8 — cômodo"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat60", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
