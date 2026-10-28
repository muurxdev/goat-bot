/**
 * .curio18 — Alfabetos e sistemas de escrita
 *
 * Alfabetos e sistemas de escrita: 6 fichas consultáveis (Alfabeto latino, Alfabeto cirílico, Escrita árabe, Devanágari, Hangul, Escrita chinesa).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "escritas"

module.exports = {
    name: "curio18",
    aliases: ["cmd_curio18","alt_curio18","atalho_curio18","abrev_curio18","call_curio18","func_curio18"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Alfabetos e sistemas de escrita",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["latino — abre a ficha de alfabeto latino","comparar latino, cirilico — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio18" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
