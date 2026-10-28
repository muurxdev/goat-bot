/**
 * .curio224 — A história do rock
 *
 * A história do rock: 6 fichas consultáveis (Rocket 88, Chuck Berry, A invasão britânica, Woodstock, Black Sabbath, O punk).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "rock"

module.exports = {
    name: "curio224",
    aliases: ["cmd_curio224","alt_curio224","atalho_curio224","abrev_curio224","call_curio224","func_curio224"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "A história do rock",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["rocket — abre a ficha de rocket 88","comparar rocket, chuckberry — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio224" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
