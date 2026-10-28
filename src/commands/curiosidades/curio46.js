/**
 * .curio46 — Os arquipélagos do mundo
 *
 * Os arquipélagos do mundo: 6 fichas consultáveis (Suécia, Indonésia, Japão, Filipinas, Maldivas, Galápagos).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "arquipelagos"

module.exports = {
    name: "curio46",
    aliases: ["cmd_curio46","alt_curio46","atalho_curio46","abrev_curio46","call_curio46","func_curio46"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os arquipélagos do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["suecia — abre a ficha de suécia","comparar suecia, indonesia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio46" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
