/**
 * .curio131 — As fontes de energia, o forte e o fraco
 *
 * As fontes de energia, o forte e o fraco: 6 fichas consultáveis (Hidrelétrica, Solar, Eólica, Nuclear, Carvão, Biomassa).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "energia"

module.exports = {
    name: "curio131",
    aliases: ["cmd_curio131","alt_curio131","atalho_curio131","abrev_curio131","call_curio131","func_curio131"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "As fontes de energia, o forte e o fraco",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["hidreletrica — abre a ficha de hidrelétrica","comparar hidreletrica, solar — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio131" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
