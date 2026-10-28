/**
 * .curio156 — As Cruzadas, expedição por expedição
 *
 * As Cruzadas, expedição por expedição: 6 fichas consultáveis (Primeira Cruzada, Segunda Cruzada, Terceira Cruzada, Quarta Cruzada, A Cruzada das Crianças, A queda de Acre).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cruzadas"

module.exports = {
    name: "curio156",
    aliases: ["cmd_curio156","alt_curio156","atalho_curio156","abrev_curio156","call_curio156","func_curio156"],
    category: "curiosidades",
    subcategory: "História",
    description: "As Cruzadas, expedição por expedição",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["primeira — abre a ficha de primeira cruzada","comparar primeira, segunda — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio156" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
