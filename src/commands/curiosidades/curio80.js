/**
 * .curio80 — Os símbolos nacionais do Brasil
 *
 * Os símbolos nacionais do Brasil: 6 fichas consultáveis (Bandeira Nacional, Hino Nacional, Armas Nacionais, Selo Nacional, Sabiá-laranjeira, Pau-brasil).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "simbolos"

module.exports = {
    name: "curio80",
    aliases: ["cmd_curio80","alt_curio80","atalho_curio80","abrev_curio80","call_curio80","func_curio80"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os símbolos nacionais do Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["bandeira — abre a ficha de bandeira nacional","comparar bandeira, hino — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio80" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
