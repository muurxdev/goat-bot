/**
 * .curio53 — Os continentes em números
 *
 * Os continentes em números: 6 fichas consultáveis (Ásia, África, América do Norte, América do Sul, Europa, Oceania).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "continentes"

module.exports = {
    name: "curio53",
    aliases: ["cmd_curio53","alt_curio53","atalho_curio53","abrev_curio53","call_curio53","func_curio53"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os continentes em números",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["asia — abre a ficha de ásia","comparar asia, africa — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio53" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
