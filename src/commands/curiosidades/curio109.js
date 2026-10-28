/**
 * .curio109 — A temperatura das coisas
 *
 * A temperatura das coisas: 6 fichas consultáveis (Zero absoluto, Espaço profundo, Corpo humano, Lava vulcânica, Superfície do Sol, Núcleo do Sol).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "temperaturas"

module.exports = {
    name: "curio109",
    aliases: ["cmd_curio109","alt_curio109","atalho_curio109","abrev_curio109","call_curio109","func_curio109"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "A temperatura das coisas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["zeroabsoluto — abre a ficha de zero absoluto","comparar zeroabsoluto, espaco — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio109" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
