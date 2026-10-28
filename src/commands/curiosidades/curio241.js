/**
 * .curio241 — Os estilos da arquitetura
 *
 * Os estilos da arquitetura: 6 fichas consultáveis (Clássico grego, Românico, Gótico, Neoclássico, Art nouveau, Modernista).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "estilosarquitetura"

module.exports = {
    name: "curio241",
    aliases: ["cmd_curio241","alt_curio241","atalho_curio241","abrev_curio241","call_curio241","func_curio241"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Os estilos da arquitetura",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["classicogrego — abre a ficha de clássico grego","comparar classicogrego, romanico — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio241" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
