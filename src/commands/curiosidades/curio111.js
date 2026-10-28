/**
 * .curio111 — O som medido em decibéis
 *
 * O som medido em decibéis: 6 fichas consultáveis (0 dB, 30 dB, 60 dB, 85 dB, 110 dB, 140 dB).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "decibeis"

module.exports = {
    name: "curio111",
    aliases: ["cmd_curio111","alt_curio111","atalho_curio111","abrev_curio111","call_curio111","func_curio111"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "O som medido em decibéis",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["limiar — abre a ficha de 0 db","comparar limiar, sussurro — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio111" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
