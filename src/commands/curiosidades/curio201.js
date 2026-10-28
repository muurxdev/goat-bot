/**
 * .curio201 — Os insetos em números
 *
 * Os insetos em números: 6 fichas consultáveis (Besouro-golias, Bicho-pau gigante, Libélula, Gafanhoto-do-deserto, Cigarra periódica, Borboleta-monarca).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "insetos"

module.exports = {
    name: "curio201",
    aliases: ["cmd_curio201","alt_curio201","atalho_curio201","abrev_curio201","call_curio201","func_curio201"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os insetos em números",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["golias — abre a ficha de besouro-golias","comparar golias, bichopau — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio201" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
