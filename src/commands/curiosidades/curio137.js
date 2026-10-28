/**
 * .curio137 — Radiação sem pânico e sem descuido
 *
 * Radiação sem pânico e sem descuido: 6 fichas consultáveis (Radiação alfa, Radiação beta, Radiação gama, Raio X, Nêutrons, Radiação natural).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "radioatividade"

module.exports = {
    name: "curio137",
    aliases: ["cmd_curio137","alt_curio137","atalho_curio137","abrev_curio137","call_curio137","func_curio137"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Radiação sem pânico e sem descuido",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["alfa — abre a ficha de radiação alfa","comparar alfa, beta — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio137" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
