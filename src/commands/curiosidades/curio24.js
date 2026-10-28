/**
 * .curio24 — Países com mais de uma capital
 *
 * Países com mais de uma capital: 6 fichas consultáveis (África do Sul, Bolívia, Países Baixos, Chile, Malásia, Benim).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "capitaisduplas"

module.exports = {
    name: "curio24",
    aliases: ["cmd_curio24","alt_curio24","atalho_curio24","abrev_curio24","call_curio24","func_curio24"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Países com mais de uma capital",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["africadosul — abre a ficha de áfrica do sul","comparar africadosul, bolivia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio24" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
