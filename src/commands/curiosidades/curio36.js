/**
 * .curio36 — Antártida, o continente sem país
 *
 * Antártida, o continente sem país: 6 fichas consultáveis (Tamanho, Espessura do gelo, Água doce guardada, Habitantes, Tratado da Antártida, Ventos catabáticos).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "antartida"

module.exports = {
    name: "curio36",
    aliases: ["cmd_curio36","alt_curio36","atalho_curio36","abrev_curio36","call_curio36","func_curio36"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Antártida, o continente sem país",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["area — abre a ficha de tamanho","comparar area, gelo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio36" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
