/**
 * .curio92 — Os aeroportos brasileiros
 *
 * Os aeroportos brasileiros: 6 fichas consultáveis (Guarulhos, Santos Dumont, Presidente Juscelino Kubitschek, Galeão, Confins, Eduardo Gomes).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "aeroportosbr"

module.exports = {
    name: "curio92",
    aliases: ["cmd_curio92","alt_curio92","atalho_curio92","abrev_curio92","call_curio92","func_curio92"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os aeroportos brasileiros",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["guarulhos — abre a ficha de guarulhos","comparar guarulhos, santosdumont — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio92" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
