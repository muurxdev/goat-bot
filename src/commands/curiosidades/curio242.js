/**
 * .curio242 — Os grandes museus do mundo
 *
 * Os grandes museus do mundo: 6 fichas consultáveis (Museu do Louvre, Museu Britânico, Metropolitan Museum, Museus Vaticanos, Museu do Prado, Hermitage).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "museusmundo"

module.exports = {
    name: "curio242",
    aliases: ["cmd_curio242","alt_curio242","atalho_curio242","abrev_curio242","call_curio242","func_curio242"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Os grandes museus do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["louvre — abre a ficha de museu do louvre","comparar louvre, britishmuseum — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio242" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
