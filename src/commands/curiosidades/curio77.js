/**
 * .curio77 — Os sotaques do português brasileiro
 *
 * Os sotaques do português brasileiro: 6 fichas consultáveis (Carioca, Caipira, Gaúcho, Nordestino, Mineiro da capital, Paraense).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "sotaques"

module.exports = {
    name: "curio77",
    aliases: ["cmd_curio77","alt_curio77","atalho_curio77","abrev_curio77","call_curio77","func_curio77"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os sotaques do português brasileiro",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["carioca — abre a ficha de carioca","comparar carioca, caipira — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio77" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
