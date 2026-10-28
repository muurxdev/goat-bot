/**
 * .curio112 — A luz que você vê e a que não vê
 *
 * A luz que você vê e a que não vê: 6 fichas consultáveis (Ondas de rádio, Micro-ondas, Infravermelho, Luz visível, Ultravioleta, Raios gama).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "espectro"

module.exports = {
    name: "curio112",
    aliases: ["cmd_curio112","alt_curio112","atalho_curio112","abrev_curio112","call_curio112","func_curio112"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "A luz que você vê e a que não vê",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["radio — abre a ficha de ondas de rádio","comparar radio, microondas — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio112" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
