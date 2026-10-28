/**
 * .curio219 — Os efeitos especiais no cinema
 *
 * Os efeitos especiais no cinema: 6 fichas consultáveis (A parada de câmera, King Kong, Guerra nas Estrelas, Jurassic Park, Matrix, Gollum).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "efeitosespeciais"

module.exports = {
    name: "curio219",
    aliases: ["cmd_curio219","alt_curio219","atalho_curio219","abrev_curio219","call_curio219","func_curio219"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Os efeitos especiais no cinema",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["paradadecamera — abre a ficha de a parada de câmera","comparar paradadecamera, kingkong — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio219" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
