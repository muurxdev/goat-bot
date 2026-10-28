/**
 * .curio104 — Galáxias e o lugar da Terra no universo
 *
 * Galáxias e o lugar da Terra no universo: 6 fichas consultáveis (Via Láctea, Andrômeda, Nuvens de Magalhães, Galáxias elípticas, Grupo Local, Universo observável).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "galaxias"

module.exports = {
    name: "curio104",
    aliases: ["cmd_curio104","alt_curio104","atalho_curio104","abrev_curio104","call_curio104","func_curio104"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Galáxias e o lugar da Terra no universo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["vialactea — abre a ficha de via láctea","comparar vialactea, andromeda — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio104" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
