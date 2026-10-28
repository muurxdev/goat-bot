/**
 * .curio235 — O Nobel e seus laureados
 *
 * O Nobel e seus laureados: 6 fichas consultáveis (Marie Curie, Albert Einstein, Alexander Fleming, Martin Luther King, Jean-Paul Sartre, Malala Yousafzai).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "nobel"

module.exports = {
    name: "curio235",
    aliases: ["cmd_curio235","alt_curio235","atalho_curio235","abrev_curio235","call_curio235","func_curio235"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "O Nobel e seus laureados",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["mariecurie — abre a ficha de marie curie","comparar mariecurie, einstein — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio235" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
