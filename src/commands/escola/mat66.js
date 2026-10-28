/**
 * .mat66 — Acha o cateto que falta com hipotenusa e cateto
 *
 * 📐 Pitágoras: achar o cateto. Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "pitagorascateto" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "pitagorascateto"

module.exports = {
    name: "mat66",
    aliases: ["cmd_mat66","alt_mat66","atalho_mat66"],
    category: "escola",
    subcategory: "Matemática",
    description: "Acha o cateto que falta com hipotenusa e cateto",
    usage: "<hipotenusa> <cateto conhecido>",
    examples: ["5 3 — hipotenusa 5 e cateto 3","13 5","10 6"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat66", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
