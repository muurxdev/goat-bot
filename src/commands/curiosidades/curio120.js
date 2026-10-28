/**
 * .curio120 — Remédios que mudaram a medicina
 *
 * Remédios que mudaram a medicina: 6 fichas consultáveis (Penicilina, Aspirina, Anestesia, Insulina, Antirretrovirais, Soro de reidratação).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "remedios"

module.exports = {
    name: "curio120",
    aliases: ["cmd_curio120","alt_curio120","atalho_curio120","abrev_curio120","call_curio120","func_curio120"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Remédios que mudaram a medicina",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["penicilina — abre a ficha de penicilina","comparar penicilina, aspirina — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio120" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
