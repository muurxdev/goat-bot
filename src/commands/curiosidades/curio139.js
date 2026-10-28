/**
 * .curio139 — A água do planeta em números
 *
 * A água do planeta em números: 6 fichas consultáveis (Água salgada, Gelo e geleira, Água subterrânea, Rios e lagos, Água na atmosfera, O gasto de uma pessoa).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "agua"

module.exports = {
    name: "curio139",
    aliases: ["cmd_curio139","alt_curio139","atalho_curio139","abrev_curio139","call_curio139","func_curio139"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "A água do planeta em números",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["salgada — abre a ficha de água salgada","comparar salgada, geleiras — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio139" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
