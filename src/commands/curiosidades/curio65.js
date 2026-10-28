/**
 * .curio65 — Comidas típicas do Centro-Oeste
 *
 * Comidas típicas do Centro-Oeste: 6 fichas consultáveis (Pacu assado, Arroz carreteiro, Chipa, Frango com pequi, Empadão goiano, Sopa paraguaia).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "comidacentro"

module.exports = {
    name: "curio65",
    aliases: ["cmd_curio65","alt_curio65","atalho_curio65","abrev_curio65","call_curio65","func_curio65"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Comidas típicas do Centro-Oeste",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["pacu — abre a ficha de pacu assado","comparar pacu, arrozcarreteiro — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio65" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
