/**
 * .curio15 — Fusos horários pelo mundo
 *
 * Fusos horários pelo mundo: 6 fichas consultáveis (Kiribati, Ilhas Baker e Howland, Nepal, Índia, China, França).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "fusos"

module.exports = {
    name: "curio15",
    aliases: ["cmd_curio15","alt_curio15","atalho_curio15","abrev_curio15","call_curio15","func_curio15"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Fusos horários pelo mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["kiribati — abre a ficha de kiribati","comparar kiribati, baker — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio15" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
