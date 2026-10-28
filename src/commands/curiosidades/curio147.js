/**
 * .curio147 — A Índia antiga e seus impérios
 *
 * A Índia antiga e seus impérios: 6 fichas consultáveis (Civilização do Indo, Império Máuria, Asoka, Império Gupta, Nalanda, Império Chola).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "indiaantiga"

module.exports = {
    name: "curio147",
    aliases: ["cmd_curio147","alt_curio147","atalho_curio147","abrev_curio147","call_curio147","func_curio147"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Índia antiga e seus impérios",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["indo — abre a ficha de civilização do indo","comparar indo, maurya — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio147" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
