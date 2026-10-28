/**
 * .curio20 — Os menores países do mundo
 *
 * Os menores países do mundo: 6 fichas consultáveis (Vaticano, Mônaco, Nauru, Tuvalu, San Marino, Liechtenstein).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "paisespequenos"

module.exports = {
    name: "curio20",
    aliases: ["cmd_curio20","alt_curio20","atalho_curio20","abrev_curio20","call_curio20","func_curio20"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os menores países do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["vaticano — abre a ficha de vaticano","comparar vaticano, monaco — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio20" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
