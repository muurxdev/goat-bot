/**
 * .curio202 — As abelhas e a polinização
 *
 * As abelhas e a polinização: 6 fichas consultáveis (Abelha-europeia, Jataí, Mandaçaia, Mamangava, Abelha-africanizada, Uruçu-amarela).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "abelhas"

module.exports = {
    name: "curio202",
    aliases: ["cmd_curio202","alt_curio202","atalho_curio202","abrev_curio202","call_curio202","func_curio202"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "As abelhas e a polinização",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["apis — abre a ficha de abelha-europeia","comparar apis, jatai — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio202" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
