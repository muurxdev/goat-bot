/**
 * .curio136 — A memória dos computadores em degraus
 *
 * A memória dos computadores em degraus: 6 fichas consultáveis (Cartão perfurado, Disquete, CD, Disco rígido, Pendrive, Nuvem).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "armazenamento"

module.exports = {
    name: "curio136",
    aliases: ["cmd_curio136","alt_curio136","atalho_curio136","abrev_curio136","call_curio136","func_curio136"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "A memória dos computadores em degraus",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["cartao — abre a ficha de cartão perfurado","comparar cartao, disquete — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio136" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
