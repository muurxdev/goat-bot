/**
 * .curio68 — Doces brasileiros e de onde vieram
 *
 * Doces brasileiros e de onde vieram: 6 fichas consultáveis (Brigadeiro, Quindim, Pé de moleque, Romeu e Julieta, Doce de leite, Cocada).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "doces"

module.exports = {
    name: "curio68",
    aliases: ["cmd_curio68","alt_curio68","atalho_curio68","abrev_curio68","call_curio68","func_curio68"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Doces brasileiros e de onde vieram",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["brigadeiro — abre a ficha de brigadeiro","comparar brigadeiro, quindim — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio68" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
