/**
 * .curio182 — Os mais rápidos por terra, mar e ar
 *
 * Os mais rápidos por terra, mar e ar: 6 fichas consultáveis (Falcão-peregrino, Guepardo, Andorinhão-preto, Peixe-vela, Tubarão-mako, Antílope-americano).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "maisrapidos"

module.exports = {
    name: "curio182",
    aliases: ["cmd_curio182","alt_curio182","atalho_curio182","abrev_curio182","call_curio182","func_curio182"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os mais rápidos por terra, mar e ar",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["falcao — abre a ficha de falcão-peregrino","comparar falcao, guepardo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio182" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
