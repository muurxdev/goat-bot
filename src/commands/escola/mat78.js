/**
 * .mat78 — Muda um número de uma base para outra
 *
 * 🔁 Converter entre bases. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "basequalquer" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "basequalquer"

module.exports = {
    name: "mat78",
    aliases: ["cmd_mat78","alt_mat78","atalho_mat78"],
    category: "escola",
    subcategory: "Matemática",
    description: "Muda um número de uma base para outra",
    usage: "<número> <base de origem> <base de destino>",
    examples: ["FF 16 10 — hexadecimal para decimal","255 10 16 — decimal para hexa","777 8 2"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat78", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
