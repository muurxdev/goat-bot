/**
 * .curio217 — Diretores que criaram uma linguagem
 *
 * Diretores que criaram uma linguagem: 6 fichas consultáveis (Alfred Hitchcock, Akira Kurosawa, Federico Fellini, Jean-Luc Godard, Steven Spielberg, Martin Scorsese).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "diretores"

module.exports = {
    name: "curio217",
    aliases: ["cmd_curio217","alt_curio217","atalho_curio217","abrev_curio217","call_curio217","func_curio217"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Diretores que criaram uma linguagem",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["hitchcock — abre a ficha de alfred hitchcock","comparar hitchcock, kurosawa — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio217" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
