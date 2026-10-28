/**
 * .curio11 — As sete maravilhas do mundo moderno
 *
 * As sete maravilhas do mundo moderno: 7 fichas consultáveis (Muralha da China, Petra, Cristo Redentor, Machu Picchu, Chichén Itzá, Coliseu, Taj Mahal).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "maravilhasnovas"

module.exports = {
    name: "curio11",
    aliases: ["cmd_curio11","alt_curio11","atalho_curio11","abrev_curio11","call_curio11","func_curio11"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "As sete maravilhas do mundo moderno",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["muralha — abre a ficha de muralha da china","comparar muralha, petra — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio11" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
