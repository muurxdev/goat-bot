/**
 * .curio158 — Os vikings, entre o remo e o arado
 *
 * Os vikings, entre o remo e o arado: 6 fichas consultáveis (O ataque a Lindisfarne, O elmo com chifre, Vinlândia, Os rus no leste, Canuto, o Grande, O Althing).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "vikings"

module.exports = {
    name: "curio158",
    aliases: ["cmd_curio158","alt_curio158","atalho_curio158","abrev_curio158","call_curio158","func_curio158"],
    category: "curiosidades",
    subcategory: "História",
    description: "Os vikings, entre o remo e o arado",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["lindisfarne — abre a ficha de o ataque a lindisfarne","comparar lindisfarne, elmodechifre — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio158" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
