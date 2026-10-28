/**
 * .curio142 — O Egito Antigo, do Nilo às pirâmides
 *
 * O Egito Antigo, do Nilo às pirâmides: 6 fichas consultáveis (As pirâmides de Gizé, Hatshepsut, Akhenaton, Tutancâmon, Ramsés II, Cleópatra VII).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "egitoantigo"

module.exports = {
    name: "curio142",
    aliases: ["cmd_curio142","alt_curio142","atalho_curio142","abrev_curio142","call_curio142","func_curio142"],
    category: "curiosidades",
    subcategory: "História",
    description: "O Egito Antigo, do Nilo às pirâmides",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["gize — abre a ficha de as pirâmides de gizé","comparar gize, hatshepsut — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio142" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
