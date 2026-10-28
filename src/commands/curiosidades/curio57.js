/**
 * .curio57 — Parques nacionais do Brasil
 *
 * Parques nacionais do Brasil: 6 fichas consultáveis (Parque Nacional do Itatiaia, Parque Nacional do Iguaçu, Parque Nacional dos Lençóis Maranhenses, Parque Nacional Serra da Capivara, Parque Nacional Montanhas do Tumucumaque, Parque Nacional da Chapada Diamantina).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "parques"

module.exports = {
    name: "curio57",
    aliases: ["cmd_curio57","alt_curio57","atalho_curio57","abrev_curio57","call_curio57","func_curio57"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Parques nacionais do Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["itatiaia — abre a ficha de parque nacional do itatiaia","comparar itatiaia, iguacu — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio57" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
