/**
 * .curio128 — Invenções que nasceram de um erro
 *
 * Invenções que nasceram de um erro: 6 fichas consultáveis (O forno de micro-ondas, O bilhete adesivo, O velcro, A borracha vulcanizada, O teflon da frigideira, A sacarina).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "invencoesacaso"

module.exports = {
    name: "curio128",
    aliases: ["cmd_curio128","alt_curio128","atalho_curio128","abrev_curio128","call_curio128","func_curio128"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Invenções que nasceram de um erro",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["microondas — abre a ficha de o forno de micro-ondas","comparar microondas, postit — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio128" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
