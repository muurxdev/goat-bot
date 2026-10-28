/**
 * .curio30 — Canais que encurtaram o mundo
 *
 * Canais que encurtaram o mundo: 6 fichas consultáveis (Canal de Suez, Canal do Panamá, Grande Canal da China, Canal de Kiel, Canal de Corinto, Canal Erie).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "canais"

module.exports = {
    name: "curio30",
    aliases: ["cmd_curio30","alt_curio30","atalho_curio30","abrev_curio30","call_curio30","func_curio30"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Canais que encurtaram o mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["suez — abre a ficha de canal de suez","comparar suez, panama — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio30" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
