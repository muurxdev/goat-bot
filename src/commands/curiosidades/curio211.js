/**
 * .curio211 — Frutas e de onde elas vieram
 *
 * Frutas e de onde elas vieram: 6 fichas consultáveis (Banana, Maçã, Laranja, Tomate, Melancia, Abacaxi).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "frutas"

module.exports = {
    name: "curio211",
    aliases: ["cmd_curio211","alt_curio211","atalho_curio211","abrev_curio211","call_curio211","func_curio211"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Frutas e de onde elas vieram",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["banana — abre a ficha de banana","comparar banana, maca — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio211" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
