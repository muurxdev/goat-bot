/**
 * .curio49 — Territórios que ficam longe do próprio país
 *
 * Territórios que ficam longe do próprio país: 6 fichas consultáveis (Guiana Francesa, Groenlândia, Havaí, Porto Rico, Ilha de Páscoa, Reunião).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "ultramar"

module.exports = {
    name: "curio49",
    aliases: ["cmd_curio49","alt_curio49","atalho_curio49","abrev_curio49","call_curio49","func_curio49"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Territórios que ficam longe do próprio país",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["guianafrancesa — abre a ficha de guiana francesa","comparar guianafrancesa, groenlandia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio49" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
