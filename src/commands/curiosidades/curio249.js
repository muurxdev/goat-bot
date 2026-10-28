/**
 * .curio249 — O automobilismo e a Fórmula 1
 *
 * O automobilismo e a Fórmula 1: 6 fichas consultáveis (Fórmula 1, Grande Prêmio de Mônaco, As 24 Horas de Le Mans, As 500 Milhas de Indianápolis, Ayrton Senna, Michael Schumacher).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "automobilismo"

module.exports = {
    name: "curio249",
    aliases: ["cmd_curio249","alt_curio249","atalho_curio249","abrev_curio249","call_curio249","func_curio249"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "O automobilismo e a Fórmula 1",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["formula1 — abre a ficha de fórmula 1","comparar formula1, monaco — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio249" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
