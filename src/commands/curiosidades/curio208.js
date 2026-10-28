/**
 * .curio208 — Bichos que só existem no Brasil
 *
 * Bichos que só existem no Brasil: 6 fichas consultáveis (Mico-leão-dourado, Preguiça-de-coleira, Ararinha-azul, Muriqui-do-norte, Soldadinho-do-araripe, Boto-do-araguaia).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "bichosbrasil"

module.exports = {
    name: "curio208",
    aliases: ["cmd_curio208","alt_curio208","atalho_curio208","abrev_curio208","call_curio208","func_curio208"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Bichos que só existem no Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["micoleao — abre a ficha de mico-leão-dourado","comparar micoleao, preguica — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio208" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
