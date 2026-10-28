/**
 * .curio27 — Os metrôs mais notáveis do mundo
 *
 * Os metrôs mais notáveis do mundo: 6 fichas consultáveis (Metrô de Londres, Metrô de Xangai, Metrô de Nova York, Metrô de Pequim, Metrô de Pyongyang, Metrô de Moscou).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "metros"

module.exports = {
    name: "curio27",
    aliases: ["cmd_curio27","alt_curio27","atalho_curio27","abrev_curio27","call_curio27","func_curio27"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os metrôs mais notáveis do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["londres — abre a ficha de metrô de londres","comparar londres, xangai — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio27" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
