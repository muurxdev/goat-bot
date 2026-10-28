/**
 * .mat32 — Soma tudo e divide pela quantidade
 *
 * 📊 Média aritmética. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "media" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "media"

module.exports = {
    name: "mat32",
    aliases: ["cmd_mat32","alt_mat32","atalho_mat32"],
    category: "escola",
    subcategory: "Matemática",
    description: "Soma tudo e divide pela quantidade",
    usage: "<número> <número> [mais números]",
    examples: ["7 8 6 9 — quatro notas","10 5 — média de duas","2,5 3,5 4"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat32", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
