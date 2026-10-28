/**
 * .curio72 — As festas juninas
 *
 * As festas juninas: 6 fichas consultáveis (Santo Antônio, São João, São Pedro, Campina Grande, Caruaru, A mesa junina).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "juninas"

module.exports = {
    name: "curio72",
    aliases: ["cmd_curio72","alt_curio72","atalho_curio72","abrev_curio72","call_curio72","func_curio72"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "As festas juninas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["santoantonio — abre a ficha de santo antônio","comparar santoantonio, saojoao — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio72" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
