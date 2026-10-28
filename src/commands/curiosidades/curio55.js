/**
 * .curio55 — Muros que dividiram o mundo
 *
 * Muros que dividiram o mundo: 6 fichas consultáveis (Muro de Berlim, Muralha de Adriano, Grande Muralha de Gorgan, Muros da paz, Berma do Saara Ocidental, Muro das Lamentações).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "muros"

module.exports = {
    name: "curio55",
    aliases: ["cmd_curio55","alt_curio55","atalho_curio55","abrev_curio55","call_curio55","func_curio55"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Muros que dividiram o mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["berlim — abre a ficha de muro de berlim","comparar berlim, adriano — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio55" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
