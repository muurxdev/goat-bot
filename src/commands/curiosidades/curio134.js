/**
 * .curio134 — Marcos da computação, degrau por degrau
 *
 * Marcos da computação, degrau por degrau: 6 fichas consultáveis (Máquina analítica de Babbage, ENIAC, Transistor, Microprocessador, Computador pessoal, Celular com tela).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "computacao"

module.exports = {
    name: "curio134",
    aliases: ["cmd_curio134","alt_curio134","atalho_curio134","abrev_curio134","call_curio134","func_curio134"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Marcos da computação, degrau por degrau",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["babbage — abre a ficha de máquina analítica de babbage","comparar babbage, eniac — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio134" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
