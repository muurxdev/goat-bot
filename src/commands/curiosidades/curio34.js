/**
 * .curio34 — Os aeroportos que mais movimentam o mundo
 *
 * Os aeroportos que mais movimentam o mundo: 6 fichas consultáveis (Hartsfield-Jackson, Aeroporto Internacional de Dubai, Aeroporto de Memphis, Chicago O Hare, Rei Fahd, Congonhas).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "aeroportos"

module.exports = {
    name: "curio34",
    aliases: ["cmd_curio34","alt_curio34","atalho_curio34","abrev_curio34","call_curio34","func_curio34"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os aeroportos que mais movimentam o mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["atlanta — abre a ficha de hartsfield-jackson","comparar atlanta, dubai — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio34" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
