/**
 * .curio140 — Como as cores se formam
 *
 * Como as cores se formam: 6 fichas consultáveis (Cor de luz, Cor de tinta, A cor de um objeto, Arco-íris, Daltonismo, Magenta).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cores"

module.exports = {
    name: "curio140",
    aliases: ["cmd_curio140","alt_curio140","atalho_curio140","abrev_curio140","call_curio140","func_curio140"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Como as cores se formam",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["luz — abre a ficha de cor de luz","comparar luz, tinta — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio140" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
