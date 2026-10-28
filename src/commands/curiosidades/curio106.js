/**
 * .curio106 — As distâncias do universo em escala
 *
 * As distâncias do universo em escala: 6 fichas consultáveis (Terra à Lua, Terra ao Sol, Terra a Netuno, Sol a Proxima Centauri, Sol ao centro da galáxia, Via Láctea a Andrômeda).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "distancias"

module.exports = {
    name: "curio106",
    aliases: ["cmd_curio106","alt_curio106","atalho_curio106","abrev_curio106","call_curio106","func_curio106"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "As distâncias do universo em escala",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["lua — abre a ficha de terra à lua","comparar lua, sol — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio106" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
