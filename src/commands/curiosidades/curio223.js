/**
 * .curio223 — Discos que mudaram a música
 *
 * Discos que mudaram a música: 6 fichas consultáveis (Kind of Blue, Pet Sounds, Sgt. Pepper's Lonely Hearts Club Band, The Dark Side of the Moon, Thriller, Nevermind).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "discos"

module.exports = {
    name: "curio223",
    aliases: ["cmd_curio223","alt_curio223","atalho_curio223","abrev_curio223","call_curio223","func_curio223"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Discos que mudaram a música",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["kindofblue — abre a ficha de kind of blue","comparar kindofblue, petsounds — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio223" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
