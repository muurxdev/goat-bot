/**
 * .curio51 — Estradas lendárias do planeta
 *
 * Estradas lendárias do planeta: 6 fichas consultáveis (Rodovia Pan-Americana, Rodovia do Karakoram, Estrada de Yungas, Rota 66, Highway 1, Estrada de Kolimá).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "estradas"

module.exports = {
    name: "curio51",
    aliases: ["cmd_curio51","alt_curio51","atalho_curio51","abrev_curio51","call_curio51","func_curio51"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Estradas lendárias do planeta",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["panamericana — abre a ficha de rodovia pan-americana","comparar panamericana, karakoram — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio51" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
