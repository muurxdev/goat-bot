/**
 * .curio99 — Faróis do litoral brasileiro
 *
 * Faróis do litoral brasileiro: 6 fichas consultáveis (Farol da Barra, Farol de Santa Marta, Farol das Conchas, Farol do Cabo Branco, Farol de São Tomé, Farol da Ilha Rasa).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "farois"

module.exports = {
    name: "curio99",
    aliases: ["cmd_curio99","alt_curio99","atalho_curio99","abrev_curio99","call_curio99","func_curio99"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Faróis do litoral brasileiro",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["barra — abre a ficha de farol da barra","comparar barra, santamarta — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio99" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
