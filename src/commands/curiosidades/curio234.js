/**
 * .curio234 — Autores da literatura mundial
 *
 * Autores da literatura mundial: 6 fichas consultáveis (William Shakespeare, Jane Austen, Fiódor Dostoiévski, Franz Kafka, Agatha Christie, J. R. R. Tolkien).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "autoresmundiais"

module.exports = {
    name: "curio234",
    aliases: ["cmd_curio234","alt_curio234","atalho_curio234","abrev_curio234","call_curio234","func_curio234"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Autores da literatura mundial",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["shakespeare — abre a ficha de william shakespeare","comparar shakespeare, janeausten — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio234" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
