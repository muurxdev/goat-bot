/**
 * .curio35 — Os voos comerciais mais longos
 *
 * Os voos comerciais mais longos: 6 fichas consultáveis (Singapura a Nova York, Auckland a Doha, Perth a Londres, São Paulo a Tóquio, Westray a Papa Westray, Sydney a Londres sem escala).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "voos"

module.exports = {
    name: "curio35",
    aliases: ["cmd_curio35","alt_curio35","atalho_curio35","abrev_curio35","call_curio35","func_curio35"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os voos comerciais mais longos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["sqnovayork — abre a ficha de singapura a nova york","comparar sqnovayork, aucklanddoha — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio35" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
