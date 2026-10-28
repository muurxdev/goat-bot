/**
 * .mat24 — MMC de dois ou mais números, com a fatoração
 *
 * 🔢 MMC — mínimo múltiplo comum. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "mmc" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "mmc"

module.exports = {
    name: "mat24",
    aliases: ["cmd_mat24","alt_mat24","atalho_mat24"],
    category: "escola",
    subcategory: "Matemática",
    description: "MMC de dois ou mais números, com a fatoração",
    usage: "<número> <número> [mais números]",
    examples: ["12 18 — o clássico da sala","4 6 10 — três números","15 25"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat24", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
