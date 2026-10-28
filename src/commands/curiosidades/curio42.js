/**
 * .curio42 — Os climas do mundo, em ordem
 *
 * Os climas do mundo, em ordem: 6 fichas consultáveis (Tropical úmido, Árido e semiárido, Temperado, Continental, Polar, Clima de montanha).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "climas"

module.exports = {
    name: "curio42",
    aliases: ["cmd_curio42","alt_curio42","atalho_curio42","abrev_curio42","call_curio42","func_curio42"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os climas do mundo, em ordem",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["tropical — abre a ficha de tropical úmido","comparar tropical, arido — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio42" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
