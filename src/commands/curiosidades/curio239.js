/**
 * .curio239 — Os movimentos da arte
 *
 * Os movimentos da arte: 6 fichas consultáveis (Renascimento, Barroco, Impressionismo, Cubismo, Surrealismo, Pop art).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "movimentosarte"

module.exports = {
    name: "curio239",
    aliases: ["cmd_curio239","alt_curio239","atalho_curio239","abrev_curio239","call_curio239","func_curio239"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Os movimentos da arte",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["renascimento — abre a ficha de renascimento","comparar renascimento, barroco — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio239" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
