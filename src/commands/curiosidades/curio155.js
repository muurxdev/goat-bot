/**
 * .curio155 — Como o feudalismo funcionava de verdade
 *
 * Como o feudalismo funcionava de verdade: 6 fichas consultáveis (O suserano, O vassalo, O cavaleiro, O servo da gleba, As banalidades, A cidade com carta de franquia).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "feudalismo"

module.exports = {
    name: "curio155",
    aliases: ["cmd_curio155","alt_curio155","atalho_curio155","abrev_curio155","call_curio155","func_curio155"],
    category: "curiosidades",
    subcategory: "História",
    description: "Como o feudalismo funcionava de verdade",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["suserano — abre a ficha de o suserano","comparar suserano, vassalo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio155" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
