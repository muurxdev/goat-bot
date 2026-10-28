/**
 * .curio41 — Furacão, tufão e ciclone
 *
 * Furacão, tufão e ciclone: 6 fichas consultáveis (Furacão, Tufão, Ciclone tropical, Catarina, Patricia, O olho da tempestade).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "tempestades"

module.exports = {
    name: "curio41",
    aliases: ["cmd_curio41","alt_curio41","atalho_curio41","abrev_curio41","call_curio41","func_curio41"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Furacão, tufão e ciclone",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["furacao — abre a ficha de furacão","comparar furacao, tufao — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio41" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
