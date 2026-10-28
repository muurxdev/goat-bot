/**
 * .curio160 — O Renascimento
 *
 * O Renascimento: 6 fichas consultáveis (Florença, Leonardo da Vinci, Michelangelo, A imprensa de Gutenberg, A perspectiva, O humanismo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "renascimento"

module.exports = {
    name: "curio160",
    aliases: ["cmd_curio160","alt_curio160","atalho_curio160","abrev_curio160","call_curio160","func_curio160"],
    category: "curiosidades",
    subcategory: "História",
    description: "O Renascimento",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["florenca — abre a ficha de florença","comparar florenca, leonardo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio160" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
