/**
 * .curio61 — Ilhas brasileiras
 *
 * Ilhas brasileiras: 6 fichas consultáveis (Ilha de Marajó, Fernando de Noronha, Ilha Grande, Ilhabela, Ilha da Trindade, Atol das Rocas).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "ilhasbr"

module.exports = {
    name: "curio61",
    aliases: ["cmd_curio61","alt_curio61","atalho_curio61","abrev_curio61","call_curio61","func_curio61"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Ilhas brasileiras",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["marajo — abre a ficha de ilha de marajó","comparar marajo, noronha — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio61" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
