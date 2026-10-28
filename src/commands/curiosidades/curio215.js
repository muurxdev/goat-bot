/**
 * .curio215 — Filmes que mudaram o cinema
 *
 * Filmes que mudaram o cinema: 6 fichas consultáveis (A Viagem à Lua, O Encouraçado Potemkin, Cidadão Kane, Ladrões de Bicicleta, Os Sete Samurais, 2001: Uma Odisseia no Espaço).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cinemaclassicos"

module.exports = {
    name: "curio215",
    aliases: ["cmd_curio215","alt_curio215","atalho_curio215","abrev_curio215","call_curio215","func_curio215"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Filmes que mudaram o cinema",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["viagemlua — abre a ficha de a viagem à lua","comparar viagemlua, potemkin — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio215" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
