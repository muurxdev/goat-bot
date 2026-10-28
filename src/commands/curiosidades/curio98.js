/**
 * .curio98 — Mercados públicos brasileiros
 *
 * Mercados públicos brasileiros: 6 fichas consultáveis (Ver-o-Peso, Mercado Municipal, Mercado Modelo, Mercado Público, Mercado Central, Mercado Adolpho Lisboa).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "mercados"

module.exports = {
    name: "curio98",
    aliases: ["cmd_curio98","alt_curio98","atalho_curio98","abrev_curio98","call_curio98","func_curio98"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Mercados públicos brasileiros",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["veropeso — abre a ficha de ver-o-peso","comparar veropeso, municipalsp — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio98" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
