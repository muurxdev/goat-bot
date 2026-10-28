/**
 * .curio26 — Cidades habitadas há mais tempo
 *
 * Cidades habitadas há mais tempo: 6 fichas consultáveis (Jericó, Damasco, Biblos, Atenas, Varanasi, Plovdiv).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cidadesantigas"

module.exports = {
    name: "curio26",
    aliases: ["cmd_curio26","alt_curio26","atalho_curio26","abrev_curio26","call_curio26","func_curio26"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Cidades habitadas há mais tempo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["jerico — abre a ficha de jericó","comparar jerico, damasco — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio26" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
