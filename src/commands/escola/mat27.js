/**
 * .mat27 — Decompõe o número em fatores primos
 *
 * 🧱 Fatoração em números primos. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "fatorar" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "fatorar"

module.exports = {
    name: "mat27",
    aliases: ["cmd_mat27","alt_mat27","atalho_mat27"],
    category: "escola",
    subcategory: "Matemática",
    description: "Decompõe o número em fatores primos",
    usage: "<número>",
    examples: ["360 — decomposição famosa","1024 — só potência de 2","2024"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat27", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
