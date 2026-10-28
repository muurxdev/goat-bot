/**
 * .curio168 — A partilha da África e o imperialismo
 *
 * A partilha da África e o imperialismo: 6 fichas consultáveis (A Conferência de Berlim, As fronteiras de régua, O Congo de Leopoldo, A Etiópia em Adua, A Índia britânica, A conversa de missão civilizadora).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "imperialismo"

module.exports = {
    name: "curio168",
    aliases: ["cmd_curio168","alt_curio168","atalho_curio168","abrev_curio168","call_curio168","func_curio168"],
    category: "curiosidades",
    subcategory: "História",
    description: "A partilha da África e o imperialismo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["berlim — abre a ficha de a conferência de berlim","comparar berlim, fronteiras — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio168" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
