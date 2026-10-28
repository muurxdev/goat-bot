/**
 * .curio146 — A China imperial, dinastia por dinastia
 *
 * A China imperial, dinastia por dinastia: 6 fichas consultáveis (Qin, Han, Tang, Song, Ming, Qing).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "chinaimperial"

module.exports = {
    name: "curio146",
    aliases: ["cmd_curio146","alt_curio146","atalho_curio146","abrev_curio146","call_curio146","func_curio146"],
    category: "curiosidades",
    subcategory: "História",
    description: "A China imperial, dinastia por dinastia",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["qin — abre a ficha de qin","comparar qin, han — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio146" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
