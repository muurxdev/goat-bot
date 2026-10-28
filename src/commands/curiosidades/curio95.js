/**
 * .curio95 — Os clássicos do futebol brasileiro
 *
 * Os clássicos do futebol brasileiro: 6 fichas consultáveis (Gre-Nal, Fla-Flu, Ba-Vi, Derby Paulista, Majestoso, Clássico Rei).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "classicos"

module.exports = {
    name: "curio95",
    aliases: ["cmd_curio95","alt_curio95","atalho_curio95","abrev_curio95","call_curio95","func_curio95"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os clássicos do futebol brasileiro",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["grenal — abre a ficha de gre-nal","comparar grenal, flaflu — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio95" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
