/**
 * .curio79 — Palavras de origem africana no português
 *
 * Palavras de origem africana no português: 6 fichas consultáveis (Caçula, Cafuné, Moleque, Quitanda, Fubá, Marimbondo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "africanas"

module.exports = {
    name: "curio79",
    aliases: ["cmd_curio79","alt_curio79","atalho_curio79","abrev_curio79","call_curio79","func_curio79"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Palavras de origem africana no português",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["cacula — abre a ficha de caçula","comparar cacula, cafune — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio79" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
