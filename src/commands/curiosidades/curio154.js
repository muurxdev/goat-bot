/**
 * .curio154 — A Idade Média sem o mito das trevas
 *
 * A Idade Média sem o mito das trevas: 6 fichas consultáveis (As universidades, O arado de aiveca, Os moinhos de água e vento, As catedrais góticas, Os óculos, O relógio mecânico).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "idademedia"

module.exports = {
    name: "curio154",
    aliases: ["cmd_curio154","alt_curio154","atalho_curio154","abrev_curio154","call_curio154","func_curio154"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Idade Média sem o mito das trevas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["universidades — abre a ficha de as universidades","comparar universidades, aradopesado — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio154" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
