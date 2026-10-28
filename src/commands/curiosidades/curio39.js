/**
 * .curio39 — Cavernas que parecem outro planeta
 *
 * Cavernas que parecem outro planeta: 6 fichas consultáveis (Caverna Mammoth, Son Doong, Veryovkina, Cueva de los Cristales, Waitomo, Lechuguilla).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cavernas"

module.exports = {
    name: "curio39",
    aliases: ["cmd_curio39","alt_curio39","atalho_curio39","abrev_curio39","call_curio39","func_curio39"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Cavernas que parecem outro planeta",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["mammoth — abre a ficha de caverna mammoth","comparar mammoth, sondoong — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio39" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
