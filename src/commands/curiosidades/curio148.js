/**
 * .curio148 — O Império Persa, de Ciro a Dario
 *
 * O Império Persa, de Ciro a Dario: 6 fichas consultáveis (Ciro, o Grande, Dario I, Xerxes I, A Estrada Real, Persépolis, Império Sassânida).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "persia"

module.exports = {
    name: "curio148",
    aliases: ["cmd_curio148","alt_curio148","atalho_curio148","abrev_curio148","call_curio148","func_curio148"],
    category: "curiosidades",
    subcategory: "História",
    description: "O Império Persa, de Ciro a Dario",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ciro — abre a ficha de ciro, o grande","comparar ciro, dario — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio148" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
