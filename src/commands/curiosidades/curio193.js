/**
 * .curio193 — Os ursos do mundo
 *
 * Os ursos do mundo: 6 fichas consultáveis (Urso-polar, Urso-pardo, Urso-negro-americano, Panda-gigante, Urso-de-óculos, Urso-malaio).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "ursos"

module.exports = {
    name: "curio193",
    aliases: ["cmd_curio193","alt_curio193","atalho_curio193","abrev_curio193","call_curio193","func_curio193"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os ursos do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["polar — abre a ficha de urso-polar","comparar polar, pardo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio193" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
