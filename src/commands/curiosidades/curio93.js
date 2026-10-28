/**
 * .curio93 — Os portos que movimentam o Brasil
 *
 * Os portos que movimentam o Brasil: 6 fichas consultáveis (Porto de Santos, Porto de Paranaguá, Porto do Itaqui, Porto de Tubarão, Porto do Rio Grande, Porto de Suape).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "portosbr"

module.exports = {
    name: "curio93",
    aliases: ["cmd_curio93","alt_curio93","atalho_curio93","abrev_curio93","call_curio93","func_curio93"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os portos que movimentam o Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["santos — abre a ficha de porto de santos","comparar santos, paranagua — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio93" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
