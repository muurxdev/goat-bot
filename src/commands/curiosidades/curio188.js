/**
 * .curio188 — Baleias e golfinhos, ficha a ficha
 *
 * Baleias e golfinhos, ficha a ficha: 6 fichas consultáveis (Baleia-azul, Cachalote, Orca, Baleia-jubarte, Golfinho-nariz-de-garrafa, Boto-cor-de-rosa).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "baleias"

module.exports = {
    name: "curio188",
    aliases: ["cmd_curio188","alt_curio188","atalho_curio188","abrev_curio188","call_curio188","func_curio188"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Baleias e golfinhos, ficha a ficha",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["baleiaazul — abre a ficha de baleia-azul","comparar baleiaazul, cachalote — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio188" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
