/**
 * .curio125 — Rochas, minerais e a escala de dureza
 *
 * Rochas, minerais e a escala de dureza: 6 fichas consultáveis (Rocha ígnea, Rocha sedimentar, Rocha metamórfica, Granito, Calcário, Diamante).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "rochas"

module.exports = {
    name: "curio125",
    aliases: ["cmd_curio125","alt_curio125","atalho_curio125","abrev_curio125","call_curio125","func_curio125"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Rochas, minerais e a escala de dureza",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ignea — abre a ficha de rocha ígnea","comparar ignea, sedimentar — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio125" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
