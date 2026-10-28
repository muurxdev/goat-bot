/**
 * .curio56 — Praias brasileiras que valem a viagem
 *
 * Praias brasileiras que valem a viagem: 6 fichas consultáveis (Praia do Cassino, Baía do Sancho, Jericoacoara, Porto de Galinhas, Lopes Mendes, Copacabana).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "praias"

module.exports = {
    name: "curio56",
    aliases: ["cmd_curio56","alt_curio56","atalho_curio56","abrev_curio56","call_curio56","func_curio56"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Praias brasileiras que valem a viagem",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["cassino — abre a ficha de praia do cassino","comparar cassino, sancho — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio56" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
