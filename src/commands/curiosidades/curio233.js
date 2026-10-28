/**
 * .curio233 — Livros que mudaram o mundo
 *
 * Livros que mudaram o mundo: 6 fichas consultáveis (A Odisseia, A Divina Comédia, Dom Quixote, A Origem das Espécies, 1984, Cem Anos de Solidão).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "literaturamundial"

module.exports = {
    name: "curio233",
    aliases: ["cmd_curio233","alt_curio233","atalho_curio233","abrev_curio233","call_curio233","func_curio233"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Livros que mudaram o mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["odisseia — abre a ficha de a odisseia","comparar odisseia, divinacomedia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio233" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
