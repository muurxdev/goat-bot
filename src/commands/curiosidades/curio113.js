/**
 * .curio113 — O corpo humano em números
 *
 * O corpo humano em números: 6 fichas consultáveis (Ossos, Batimentos, Sangue bombeado, Células, Água no corpo, Pele).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "corponumeros"

module.exports = {
    name: "curio113",
    aliases: ["cmd_curio113","alt_curio113","atalho_curio113","abrev_curio113","call_curio113","func_curio113"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "O corpo humano em números",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ossos — abre a ficha de ossos","comparar ossos, batimentos — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio113" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
