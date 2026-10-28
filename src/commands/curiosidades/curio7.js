/**
 * .curio7 — Lagos que quebram recordes
 *
 * Lagos que quebram recordes: 6 fichas consultáveis (Mar Cáspio, Lago Baikal, Lago Superior, Lago Vitória, Lago Titicaca, Mar Morto).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "lagos"

module.exports = {
    name: "curio7",
    aliases: ["cmd_curio7","alt_curio7","atalho_curio7","abrev_curio7","call_curio7","func_curio7"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Lagos que quebram recordes",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["caspio — abre a ficha de mar cáspio","comparar caspio, baikal — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio7" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
