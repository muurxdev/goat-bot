/**
 * .curio162 — Reforma e Contrarreforma
 *
 * Reforma e Contrarreforma: 6 fichas consultáveis (Martinho Lutero, As indulgências, João Calvino, A Igreja da Inglaterra, O Concílio de Trento, A Paz de Augsburgo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "reforma"

module.exports = {
    name: "curio162",
    aliases: ["cmd_curio162","alt_curio162","atalho_curio162","abrev_curio162","call_curio162","func_curio162"],
    category: "curiosidades",
    subcategory: "História",
    description: "Reforma e Contrarreforma",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["lutero — abre a ficha de martinho lutero","comparar lutero, indulgencias — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio162" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
