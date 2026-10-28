/**
 * .curio143 — A Grécia Antiga, cidade por cidade
 *
 * A Grécia Antiga, cidade por cidade: 6 fichas consultáveis (Atenas, Esparta, Corinto, Tebas, Siracusa, Mileto).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "greciaantiga"

module.exports = {
    name: "curio143",
    aliases: ["cmd_curio143","alt_curio143","atalho_curio143","abrev_curio143","call_curio143","func_curio143"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Grécia Antiga, cidade por cidade",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["atenas — abre a ficha de atenas","comparar atenas, esparta — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio143" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
