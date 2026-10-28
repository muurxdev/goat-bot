/**
 * .curio227 — A ópera e suas obras
 *
 * A ópera e suas obras: 6 fichas consultáveis (Orfeu, A Flauta Mágica, O Barbeiro de Sevilha, La Traviata, Carmen, O Anel do Nibelungo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "opera"

module.exports = {
    name: "curio227",
    aliases: ["cmd_curio227","alt_curio227","atalho_curio227","abrev_curio227","call_curio227","func_curio227"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "A ópera e suas obras",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["orfeu — abre a ficha de orfeu","comparar orfeu, flauta — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio227" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
