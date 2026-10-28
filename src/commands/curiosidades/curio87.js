/**
 * .curio87 — Museus brasileiros que valem a fila
 *
 * Museus brasileiros que valem a fila: 6 fichas consultáveis (Museu Nacional, MASP, Inhotim, Museu do Amanhã, Museu do Ipiranga, Pinacoteca de São Paulo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "museusbr"

module.exports = {
    name: "curio87",
    aliases: ["cmd_curio87","alt_curio87","atalho_curio87","abrev_curio87","call_curio87","func_curio87"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Museus brasileiros que valem a fila",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["museunacional — abre a ficha de museu nacional","comparar museunacional, masp — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio87" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
