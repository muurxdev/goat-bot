/**
 * .curio37 — Geleiras e calotas de gelo
 *
 * Geleiras e calotas de gelo: 6 fichas consultáveis (Geleira Lambert, Calota da Groenlândia, Perito Moreno, Vatnajökull, Geleira de Aletsch, Geleira de Siachen).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "geleiras"

module.exports = {
    name: "curio37",
    aliases: ["cmd_curio37","alt_curio37","atalho_curio37","abrev_curio37","call_curio37","func_curio37"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Geleiras e calotas de gelo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["lambert — abre a ficha de geleira lambert","comparar lambert, groenlandia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio37" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
