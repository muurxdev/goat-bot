/**
 * .curio226 — Os compositores da música clássica
 *
 * Os compositores da música clássica: 6 fichas consultáveis (Johann Sebastian Bach, Wolfgang Amadeus Mozart, Ludwig van Beethoven, Frédéric Chopin, Igor Stravinsky, Heitor Villa-Lobos).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "compositoresclassicos"

module.exports = {
    name: "curio226",
    aliases: ["cmd_curio226","alt_curio226","atalho_curio226","abrev_curio226","call_curio226","func_curio226"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Os compositores da música clássica",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["bach — abre a ficha de johann sebastian bach","comparar bach, mozart — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio226" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
