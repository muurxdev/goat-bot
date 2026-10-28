/**
 * .curio96 — Os estádios brasileiros
 *
 * Os estádios brasileiros: 6 fichas consultáveis (Morumbi, Mineirão, Beira-Rio, Arena Corinthians, Castelão, Pacaembu).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "estadiosbr"

module.exports = {
    name: "curio96",
    aliases: ["cmd_curio96","alt_curio96","atalho_curio96","abrev_curio96","call_curio96","func_curio96"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os estádios brasileiros",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["morumbi — abre a ficha de morumbi","comparar morumbi, mineirao — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio96" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
