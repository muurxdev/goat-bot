/**
 * .curio180 — Os maiores animais do planeta
 *
 * Os maiores animais do planeta: 6 fichas consultáveis (Baleia-azul, Tubarão-baleia, Elefante-africano, Girafa, Avestruz, Lula-colossal).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "maioresanimais"

module.exports = {
    name: "curio180",
    aliases: ["cmd_curio180","alt_curio180","atalho_curio180","abrev_curio180","call_curio180","func_curio180"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os maiores animais do planeta",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["baleiaazul — abre a ficha de baleia-azul","comparar baleiaazul, tubaraobaleia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio180" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
