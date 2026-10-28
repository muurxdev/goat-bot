/**
 * .curio1 — Os maiores desertos do mundo
 *
 * Os maiores desertos do mundo: 6 fichas consultáveis (Deserto Antártico, Deserto Ártico, Saara, Deserto da Arábia, Gobi, Atacama).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "desertos"

module.exports = {
    name: "curio1",
    aliases: ["cmd_curio1","alt_curio1","atalho_curio1","abrev_curio1","call_curio1","func_curio1"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os maiores desertos do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["antartico — abre a ficha de deserto antártico","comparar antartico, artico — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio1" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
