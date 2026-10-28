/**
 * .curio150 — Os maias, cidades dentro da floresta
 *
 * Os maias, cidades dentro da floresta: 6 fichas consultáveis (Tikal, Calakmul, Palenque, Copán, Chichén Itzá, A escrita e a conta do tempo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "maias"

module.exports = {
    name: "curio150",
    aliases: ["cmd_curio150","alt_curio150","atalho_curio150","abrev_curio150","call_curio150","func_curio150"],
    category: "curiosidades",
    subcategory: "História",
    description: "Os maias, cidades dentro da floresta",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["tikal — abre a ficha de tikal","comparar tikal, calakmul — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio150" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
