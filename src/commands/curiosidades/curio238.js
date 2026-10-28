/**
 * .curio238 — Pintores e seus estilos
 *
 * Pintores e seus estilos: 6 fichas consultáveis (Johannes Vermeer, Claude Monet, Vincent van Gogh, Pablo Picasso, Salvador Dalí, Frida Kahlo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "pintores"

module.exports = {
    name: "curio238",
    aliases: ["cmd_curio238","alt_curio238","atalho_curio238","abrev_curio238","call_curio238","func_curio238"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Pintores e seus estilos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["vermeer — abre a ficha de johannes vermeer","comparar vermeer, monet — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio238" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
