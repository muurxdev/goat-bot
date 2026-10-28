/**
 * .curio174 — A descolonização da África e da Ásia
 *
 * A descolonização da África e da Ásia: 6 fichas consultáveis (Índia e Paquistão, Gana, Argélia, O Ano da África, As colônias portuguesas na África, A conferência de Bandung).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "descolonizacao"

module.exports = {
    name: "curio174",
    aliases: ["cmd_curio174","alt_curio174","atalho_curio174","abrev_curio174","call_curio174","func_curio174"],
    category: "curiosidades",
    subcategory: "História",
    description: "A descolonização da África e da Ásia",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["indiapaquistao — abre a ficha de índia e paquistão","comparar indiapaquistao, gana — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio174" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
