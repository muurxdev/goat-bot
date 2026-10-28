/**
 * .mat48 — Abre a potência de 10 e escreve o número inteiro
 *
 * 🔭 Notação científica para número. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "denotacao" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "denotacao"

module.exports = {
    name: "mat48",
    aliases: ["cmd_mat48","alt_mat48","atalho_mat48"],
    category: "escola",
    subcategory: "Matemática",
    description: "Abre a potência de 10 e escreve o número inteiro",
    usage: "<mantissa> <expoente>",
    examples: ["3 8 — 3 x 10^8","4,5 -6 — número pequeno","1,6 -19 — carga do elétron"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat48", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
