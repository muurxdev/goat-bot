/**
 * .curio192 — Os primatas
 *
 * Os primatas: 6 fichas consultáveis (Gorila-do-ocidente, Chimpanzé, Bonobo, Orangotango-de-bornéu, Mandril, Muriqui-do-norte).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "primatas"

module.exports = {
    name: "curio192",
    aliases: ["cmd_curio192","alt_curio192","atalho_curio192","abrev_curio192","call_curio192","func_curio192"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os primatas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["gorila — abre a ficha de gorila-do-ocidente","comparar gorila, chimpanze — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio192" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
