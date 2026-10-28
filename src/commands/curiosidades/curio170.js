/**
 * .curio170 — A Revolução Russa
 *
 * A Revolução Russa: 6 fichas consultáveis (A Revolução de Fevereiro, O Governo Provisório, A Revolução de Outubro, A guerra civil, A criação da União Soviética, A disputa pela sucessão).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "revolucaorussa"

module.exports = {
    name: "curio170",
    aliases: ["cmd_curio170","alt_curio170","atalho_curio170","abrev_curio170","call_curio170","func_curio170"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Revolução Russa",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["fevereiro — abre a ficha de a revolução de fevereiro","comparar fevereiro, governoprovisorio — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio170" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
