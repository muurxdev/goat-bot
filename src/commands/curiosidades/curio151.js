/**
 * .curio151 — Os astecas e a cidade sobre o lago
 *
 * Os astecas e a cidade sobre o lago: 6 fichas consultáveis (Tenochtitlán, As chinampas, A Tríplice Aliança, Os pochteca, O cacau como dinheiro, A queda de 1521).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "astecas"

module.exports = {
    name: "curio151",
    aliases: ["cmd_curio151","alt_curio151","atalho_curio151","abrev_curio151","call_curio151","func_curio151"],
    category: "curiosidades",
    subcategory: "História",
    description: "Os astecas e a cidade sobre o lago",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["tenochtitlan — abre a ficha de tenochtitlán","comparar tenochtitlan, chinampas — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio151" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
