/**
 * .curio58 — As cachoeiras brasileiras que impressionam
 *
 * As cachoeiras brasileiras que impressionam: 6 fichas consultáveis (Cachoeira da Fumaça, Cachoeira do Tabuleiro, Salto do Itiquira, Cascata do Caracol, Véu de Noiva, Sete Quedas de Guaíra).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cachoeiras"

module.exports = {
    name: "curio58",
    aliases: ["cmd_curio58","alt_curio58","atalho_curio58","abrev_curio58","call_curio58","func_curio58"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "As cachoeiras brasileiras que impressionam",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["fumaca — abre a ficha de cachoeira da fumaça","comparar fumaca, tabuleiro — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio58" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
