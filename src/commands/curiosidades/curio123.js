/**
 * .curio123 — As cinco grandes extinções, e a sexta
 *
 * As cinco grandes extinções, e a sexta: 6 fichas consultáveis (Extinção do Ordoviciano, Extinção do Devoniano, Extinção do Permiano, Extinção do Triássico, Extinção do Cretáceo, A extinção em curso).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "extincoes"

module.exports = {
    name: "curio123",
    aliases: ["cmd_curio123","alt_curio123","atalho_curio123","abrev_curio123","call_curio123","func_curio123"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "As cinco grandes extinções, e a sexta",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ordoviciano — abre a ficha de extinção do ordoviciano","comparar ordoviciano, devoniano — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio123" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
