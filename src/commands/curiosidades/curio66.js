/**
 * .curio66 — Comidas típicas do Sudeste
 *
 * Comidas típicas do Sudeste: 6 fichas consultáveis (Feijoada, Pão de queijo, Virado à paulista, Torresmo de rolo, Moqueca capixaba, Queijo minas artesanal).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "comidasudeste"

module.exports = {
    name: "curio66",
    aliases: ["cmd_curio66","alt_curio66","atalho_curio66","abrev_curio66","call_curio66","func_curio66"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Comidas típicas do Sudeste",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["feijoada — abre a ficha de feijoada","comparar feijoada, paodequeijo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio66" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
