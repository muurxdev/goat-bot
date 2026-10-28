/**
 * .curio126 — As camadas do ar, da troposfera ao espaço
 *
 * As camadas do ar, da troposfera ao espaço: 6 fichas consultáveis (Troposfera, Estratosfera, Mesosfera, Termosfera, Exosfera, A linha do espaço).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "atmosfera"

module.exports = {
    name: "curio126",
    aliases: ["cmd_curio126","alt_curio126","atalho_curio126","abrev_curio126","call_curio126","func_curio126"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "As camadas do ar, da troposfera ao espaço",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["troposfera — abre a ficha de troposfera","comparar troposfera, estratosfera — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio126" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
