/**
 * .curio29 — Os túneis mais impressionantes
 *
 * Os túneis mais impressionantes: 6 fichas consultáveis (Túnel de Base de São Gotardo, Túnel Seikan, Eurotúnel, Túnel de Lærdal, Aqueduto do Delaware, Túnel de Zhongnanshan).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "tuneis"

module.exports = {
    name: "curio29",
    aliases: ["cmd_curio29","alt_curio29","atalho_curio29","abrev_curio29","call_curio29","func_curio29"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os túneis mais impressionantes",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["gotardo — abre a ficha de túnel de base de são gotardo","comparar gotardo, seikan — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio29" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
