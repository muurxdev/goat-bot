/**
 * .curio124 — Fósseis e como se data o passado
 *
 * Fósseis e como se data o passado: 6 fichas consultáveis (Carbono 14, Potássio-argônio, Camadas do terreno, Âmbar, Pegadas, Fóssil vivo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "fosseis"

module.exports = {
    name: "curio124",
    aliases: ["cmd_curio124","alt_curio124","atalho_curio124","abrev_curio124","call_curio124","func_curio124"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Fósseis e como se data o passado",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["carbono14 — abre a ficha de carbono 14","comparar carbono14, potassioargonio — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio124" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
