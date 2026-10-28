/**
 * .curio64 — Comidas típicas do Nordeste
 *
 * Comidas típicas do Nordeste: 6 fichas consultáveis (Acarajé, Moqueca, Baião de dois, Carne de sol, Bolo de rolo, Cuscuz nordestino).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "comidanordeste"

module.exports = {
    name: "curio64",
    aliases: ["cmd_curio64","alt_curio64","atalho_curio64","abrev_curio64","call_curio64","func_curio64"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Comidas típicas do Nordeste",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["acaraje — abre a ficha de acarajé","comparar acaraje, moqueca — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio64" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
