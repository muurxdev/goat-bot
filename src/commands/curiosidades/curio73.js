/**
 * .curio73 — Brincadeiras tradicionais brasileiras
 *
 * Brincadeiras tradicionais brasileiras: 6 fichas consultáveis (Peteca, Pipa, Bolinha de gude, Amarelinha, Cinco Marias, Cabo de guerra).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "brincadeiras"

module.exports = {
    name: "curio73",
    aliases: ["cmd_curio73","alt_curio73","atalho_curio73","abrev_curio73","call_curio73","func_curio73"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Brincadeiras tradicionais brasileiras",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["peteca — abre a ficha de peteca","comparar peteca, pipa — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio73" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
