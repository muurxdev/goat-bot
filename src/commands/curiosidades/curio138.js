/**
 * .curio138 — Como a humanidade mediu o tempo
 *
 * Como a humanidade mediu o tempo: 6 fichas consultáveis (Relógio de sol, Relógio de água, Ampulheta, Relógio de pêndulo, Relógio de quartzo, Relógio atômico).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "relogios"

module.exports = {
    name: "curio138",
    aliases: ["cmd_curio138","alt_curio138","atalho_curio138","abrev_curio138","call_curio138","func_curio138"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Como a humanidade mediu o tempo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["solar — abre a ficha de relógio de sol","comparar solar, agua — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio138" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
