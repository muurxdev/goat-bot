/**
 * .curio78 — Palavras do dia a dia que vêm do tupi
 *
 * Palavras do dia a dia que vêm do tupi: 6 fichas consultáveis (Abacaxi, Pipoca, Jacaré, Mingau, Capim, Curitiba).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "tupi"

module.exports = {
    name: "curio78",
    aliases: ["cmd_curio78","alt_curio78","atalho_curio78","abrev_curio78","call_curio78","func_curio78"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Palavras do dia a dia que vêm do tupi",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["abacaxi — abre a ficha de abacaxi","comparar abacaxi, pipoca — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio78" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
