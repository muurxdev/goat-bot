/**
 * .curio225 — O jazz e o blues
 *
 * O jazz e o blues: 6 fichas consultáveis (O blues do Delta, Nova Orleans, A era do swing, O bebop, O blues elétrico, O jazz livre).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "jazzblues"

module.exports = {
    name: "curio225",
    aliases: ["cmd_curio225","alt_curio225","atalho_curio225","abrev_curio225","call_curio225","func_curio225"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "O jazz e o blues",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["delta — abre a ficha de o blues do delta","comparar delta, neworleans — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio225" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
