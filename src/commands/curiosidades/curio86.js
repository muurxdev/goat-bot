/**
 * .curio86 — Arquitetos que desenharam o Brasil
 *
 * Arquitetos que desenharam o Brasil: 6 fichas consultáveis (Aleijadinho, Lúcio Costa, Oscar Niemeyer, Lina Bo Bardi, Roberto Burle Marx, Paulo Mendes da Rocha).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "arquiteturabr"

module.exports = {
    name: "curio86",
    aliases: ["cmd_curio86","alt_curio86","atalho_curio86","abrev_curio86","call_curio86","func_curio86"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Arquitetos que desenharam o Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["aleijadinho — abre a ficha de aleijadinho","comparar aleijadinho, lucio — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio86" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
