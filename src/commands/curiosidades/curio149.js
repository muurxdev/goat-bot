/**
 * .curio149 — Fenícios, Cartago e o mar Mediterrâneo
 *
 * Fenícios, Cartago e o mar Mediterrâneo: 6 fichas consultáveis (Biblos, Tiro, Sídon, O alfabeto fenício, Cartago, Aníbal Barca).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "fenicios"

module.exports = {
    name: "curio149",
    aliases: ["cmd_curio149","alt_curio149","atalho_curio149","abrev_curio149","call_curio149","func_curio149"],
    category: "curiosidades",
    subcategory: "História",
    description: "Fenícios, Cartago e o mar Mediterrâneo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["biblos — abre a ficha de biblos","comparar biblos, tiro — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio149" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
