/**
 * .curio185 — Bichos à beira do fim
 *
 * Bichos à beira do fim: 6 fichas consultáveis (Vaquita, Rinoceronte-de-java, Gorila-das-montanhas, Kakapo, Mico-leão-dourado, Tartaruga-de-pente).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "ameacados"

module.exports = {
    name: "curio185",
    aliases: ["cmd_curio185","alt_curio185","atalho_curio185","abrev_curio185","call_curio185","func_curio185"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Bichos à beira do fim",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["vaquita — abre a ficha de vaquita","comparar vaquita, rinoceronte — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio185" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
