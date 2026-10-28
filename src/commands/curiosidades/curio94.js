/**
 * .curio94 — Os metrôs e trens urbanos do Brasil
 *
 * Os metrôs e trens urbanos do Brasil: 6 fichas consultáveis (Metrô de São Paulo, Metrô do Rio, Metrô do Recife, Trensurb, Metrô de Brasília, Metrô de Salvador).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "metrosbr"

module.exports = {
    name: "curio94",
    aliases: ["cmd_curio94","alt_curio94","atalho_curio94","abrev_curio94","call_curio94","func_curio94"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os metrôs e trens urbanos do Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["saopaulo — abre a ficha de metrô de são paulo","comparar saopaulo, rio — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio94" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
