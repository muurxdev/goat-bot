/**
 * .curio67 — Comidas típicas do Sul
 *
 * Comidas típicas do Sul: 6 fichas consultáveis (Churrasco gaúcho, Chimarrão, Barreado, Pinhão, Cuca, Galeto ao primeiro canto).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "comidasul"

module.exports = {
    name: "curio67",
    aliases: ["cmd_curio67","alt_curio67","atalho_curio67","abrev_curio67","call_curio67","func_curio67"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Comidas típicas do Sul",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["churrasco — abre a ficha de churrasco gaúcho","comparar churrasco, chimarrao — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio67" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
