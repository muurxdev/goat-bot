/**
 * .curio33 — Os maiores estádios do mundo
 *
 * Os maiores estádios do mundo: 6 fichas consultáveis (Rungrado Primeiro de Maio, Michigan Stadium, Melbourne Cricket Ground, Camp Nou, Maracanã, Estádio Azteca).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "estadios"

module.exports = {
    name: "curio33",
    aliases: ["cmd_curio33","alt_curio33","atalho_curio33","abrev_curio33","call_curio33","func_curio33"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os maiores estádios do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["rungrado — abre a ficha de rungrado primeiro de maio","comparar rungrado, michigan — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio33" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
