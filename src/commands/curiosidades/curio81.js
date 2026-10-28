/**
 * .curio81 — O Hino Nacional, verso por verso
 *
 * O Hino Nacional, verso por verso: 6 fichas consultáveis (Ouviram do Ipiranga as margens plácidas, De um povo heroico o brado retumbante, E o sol da liberdade em raios fúlgidos, Deitado eternamente em berço esplêndido, Verás que um filho teu não foge à luta, As duas partes).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "hino"

module.exports = {
    name: "curio81",
    aliases: ["cmd_curio81","alt_curio81","atalho_curio81","abrev_curio81","call_curio81","func_curio81"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "O Hino Nacional, verso por verso",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ipiranga — abre a ficha de ouviram do ipiranga as margens plácidas","comparar ipiranga, brado — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio81" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
