/**
 * .curio196 — Os pinguins
 *
 * Os pinguins: 6 fichas consultáveis (Pinguim-imperador, Pinguim-rei, Pinguim-gentoo, Pinguim-de-adélia, Pinguim-de-galápagos, Pinguim-azul).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "pinguins"

module.exports = {
    name: "curio196",
    aliases: ["cmd_curio196","alt_curio196","atalho_curio196","abrev_curio196","call_curio196","func_curio196"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os pinguins",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["imperador — abre a ficha de pinguim-imperador","comparar imperador, rei — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio196" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
