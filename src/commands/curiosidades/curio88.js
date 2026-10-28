/**
 * .curio88 — Os grandes teatros brasileiros
 *
 * Os grandes teatros brasileiros: 6 fichas consultáveis (Teatro Amazonas, Theatro Municipal do Rio, Theatro Municipal de São Paulo, Theatro da Paz, Teatro José de Alencar, Teatro Guaíra).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "teatros"

module.exports = {
    name: "curio88",
    aliases: ["cmd_curio88","alt_curio88","atalho_curio88","abrev_curio88","call_curio88","func_curio88"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os grandes teatros brasileiros",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["amazonas — abre a ficha de teatro amazonas","comparar amazonas, municipalrio — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio88" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
