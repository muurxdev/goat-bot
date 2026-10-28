/**
 * .curio153 — Reinos africanos antes da colonização
 *
 * Reinos africanos antes da colonização: 6 fichas consultáveis (Império do Gana, Império do Mali, Império Songai, Reino de Axum, Grande Zimbábue, Reino do Benim).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "africaantiga"

module.exports = {
    name: "curio153",
    aliases: ["cmd_curio153","alt_curio153","atalho_curio153","abrev_curio153","call_curio153","func_curio153"],
    category: "curiosidades",
    subcategory: "História",
    description: "Reinos africanos antes da colonização",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["gana — abre a ficha de império do gana","comparar gana, mali — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio153" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
