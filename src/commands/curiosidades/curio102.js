/**
 * .curio102 — Os tipos de estrela e como cada uma acaba
 *
 * Os tipos de estrela e como cada uma acaba: 6 fichas consultáveis (Anã vermelha, Anã amarela, Gigante vermelha, Anã branca, Supergigante, Estrela de nêutrons).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "tiposestrela"

module.exports = {
    name: "curio102",
    aliases: ["cmd_curio102","alt_curio102","atalho_curio102","abrev_curio102","call_curio102","func_curio102"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Os tipos de estrela e como cada uma acaba",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ananvermelha — abre a ficha de anã vermelha","comparar ananvermelha, ananamarela — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio102" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
