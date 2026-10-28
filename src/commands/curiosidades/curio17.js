/**
 * .curio17 — Os idiomas mais falados do mundo
 *
 * Os idiomas mais falados do mundo: 6 fichas consultáveis (Inglês, Mandarim, Hindi, Espanhol, Português, Árabe).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "idiomas"

module.exports = {
    name: "curio17",
    aliases: ["cmd_curio17","alt_curio17","atalho_curio17","abrev_curio17","call_curio17","func_curio17"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os idiomas mais falados do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ingles — abre a ficha de inglês","comparar ingles, mandarim — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio17" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
