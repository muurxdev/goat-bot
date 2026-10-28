/**
 * .curio28 — Pontes que desafiam o bom senso
 *
 * Pontes que desafiam o bom senso: 6 fichas consultáveis (Ponte 1915 Çanakkale, Ponte Akashi Kaikyo, Viaduto Danyang-Kunshan, Ponte Hong Kong-Zhuhai-Macau, Golden Gate, Ponte de Duge).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "pontes"

module.exports = {
    name: "curio28",
    aliases: ["cmd_curio28","alt_curio28","atalho_curio28","abrev_curio28","call_curio28","func_curio28"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Pontes que desafiam o bom senso",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["canakkale — abre a ficha de ponte 1915 çanakkale","comparar canakkale, akashi — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio28" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
