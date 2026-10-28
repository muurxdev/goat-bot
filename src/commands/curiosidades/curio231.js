/**
 * .curio231 — Mangá e anime
 *
 * Mangá e anime: 6 fichas consultáveis (Osamu Tezuka, Dragon Ball, Akira, Neon Genesis Evangelion, A Viagem de Chihiro, Os Cavaleiros do Zodíaco).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "mangaanime"

module.exports = {
    name: "curio231",
    aliases: ["cmd_curio231","alt_curio231","atalho_curio231","abrev_curio231","call_curio231","func_curio231"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Mangá e anime",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["tezuka — abre a ficha de osamu tezuka","comparar tezuka, dragonball — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio231" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
