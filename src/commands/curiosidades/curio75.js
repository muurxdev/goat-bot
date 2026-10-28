/**
 * .curio75 — Artesanato brasileiro por região
 *
 * Artesanato brasileiro por região: 6 fichas consultáveis (Cerâmica marajoara, Renda renascença, Capim dourado, Figuras de barro, Panelas de barro, Redes de dormir).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "artesanato"

module.exports = {
    name: "curio75",
    aliases: ["cmd_curio75","alt_curio75","atalho_curio75","abrev_curio75","call_curio75","func_curio75"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Artesanato brasileiro por região",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["marajoara — abre a ficha de cerâmica marajoara","comparar marajoara, renderenascenca — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio75" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
