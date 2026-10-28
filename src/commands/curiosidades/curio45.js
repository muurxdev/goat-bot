/**
 * .curio45 — Penínsulas, istmos e cabos
 *
 * Penínsulas, istmos e cabos: 6 fichas consultáveis (Península Arábica, Península Ibérica, Península Escandinava, Istmo do Panamá, Istmo de Suez, Cabo da Boa Esperança).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "peninsulas"

module.exports = {
    name: "curio45",
    aliases: ["cmd_curio45","alt_curio45","atalho_curio45","abrev_curio45","call_curio45","func_curio45"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Penínsulas, istmos e cabos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["arabica — abre a ficha de península arábica","comparar arabica, iberica — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio45" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
