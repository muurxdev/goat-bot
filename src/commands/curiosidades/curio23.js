/**
 * .curio23 — Capitais que não são a maior cidade
 *
 * Capitais que não são a maior cidade: 6 fichas consultáveis (Brasília, Washington, D.C., Canberra, Ancara, Ottawa, Abuja).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "capitaisnaomaiores"

module.exports = {
    name: "curio23",
    aliases: ["cmd_curio23","alt_curio23","atalho_curio23","abrev_curio23","call_curio23","func_curio23"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Capitais que não são a maior cidade",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["brasilia — abre a ficha de brasília","comparar brasilia, washington — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio23" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
