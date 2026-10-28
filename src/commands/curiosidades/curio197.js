/**
 * .curio197 — As serpentes, cobra por cobra
 *
 * As serpentes, cobra por cobra: 6 fichas consultáveis (Sucuri-verde, Píton-reticulada, Naja-real, Cascavel, Jararaca, Mamba-negra).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cobras"

module.exports = {
    name: "curio197",
    aliases: ["cmd_curio197","alt_curio197","atalho_curio197","abrev_curio197","call_curio197","func_curio197"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "As serpentes, cobra por cobra",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["sucuri — abre a ficha de sucuri-verde","comparar sucuri, piton — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio197" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
