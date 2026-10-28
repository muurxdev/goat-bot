/**
 * .curio97 — Parques urbanos brasileiros
 *
 * Parques urbanos brasileiros: 6 fichas consultáveis (Parque Ibirapuera, Parque do Flamengo, Jardim Botânico do Rio, Parque Barigui, Parque Farroupilha, Parque das Mangabeiras).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "parquesurbanos"

module.exports = {
    name: "curio97",
    aliases: ["cmd_curio97","alt_curio97","atalho_curio97","abrev_curio97","call_curio97","func_curio97"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Parques urbanos brasileiros",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ibirapuera — abre a ficha de parque ibirapuera","comparar ibirapuera, flamengo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio97" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
