/**
 * .curio172 — A Segunda Guerra Mundial
 *
 * A Segunda Guerra Mundial: 6 fichas consultáveis (A invasão da Polônia, A guerra-relâmpago, A frente oriental, Pearl Harbor e o Pacífico, O Holocausto, O fim da guerra).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "segundaguerra"

module.exports = {
    name: "curio172",
    aliases: ["cmd_curio172","alt_curio172","atalho_curio172","abrev_curio172","call_curio172","func_curio172"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Segunda Guerra Mundial",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["polonia — abre a ficha de a invasão da polônia","comparar polonia, guerrarelampago — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio172" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
