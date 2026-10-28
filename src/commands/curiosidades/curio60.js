/**
 * .curio60 — Os rios brasileiros que moldaram o país
 *
 * Os rios brasileiros que moldaram o país: 6 fichas consultáveis (Rio São Francisco, Rio Negro, Rio Madeira, Rio Tietê, Rio Araguaia, Rio Paraná).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "riosbr"

module.exports = {
    name: "curio60",
    aliases: ["cmd_curio60","alt_curio60","atalho_curio60","abrev_curio60","call_curio60","func_curio60"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os rios brasileiros que moldaram o país",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["saofrancisco — abre a ficha de rio são francisco","comparar saofrancisco, negro — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio60" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
