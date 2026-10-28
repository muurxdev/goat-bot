/**
 * .curio145 — O Império Romano e seus imperadores
 *
 * O Império Romano e seus imperadores: 6 fichas consultáveis (Augusto, Nero, Trajano, Marco Aurélio, Diocleciano, Constantino).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "imperioromano"

module.exports = {
    name: "curio145",
    aliases: ["cmd_curio145","alt_curio145","atalho_curio145","abrev_curio145","call_curio145","func_curio145"],
    category: "curiosidades",
    subcategory: "História",
    description: "O Império Romano e seus imperadores",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["augusto — abre a ficha de augusto","comparar augusto, nero — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio145" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
