/**
 * .mat68 — Acha os catetos sabendo ângulo e hipotenusa
 *
 * 📊 Triângulo retângulo por ângulo. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "trigtriangulo" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "trigtriangulo"

module.exports = {
    name: "mat68",
    aliases: ["cmd_mat68","alt_mat68","atalho_mat68"],
    category: "escola",
    subcategory: "Matemática",
    description: "Acha os catetos sabendo ângulo e hipotenusa",
    usage: "<ângulo em graus> <hipotenusa>",
    examples: ["30 10 — rampa de 30 graus e 10 de comprimento","45 7,07","60 20"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat68", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
