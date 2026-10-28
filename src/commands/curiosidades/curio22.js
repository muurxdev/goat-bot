/**
 * .curio22 — Fronteiras que contam uma história
 *
 * Fronteiras que contam uma história: 6 fichas consultáveis (China e Rússia, Brasil, Baarle-Hertog e Baarle-Nassau, Zona Desmilitarizada das Coreias, Estados Unidos e Canadá, Lesoto).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "fronteiras"

module.exports = {
    name: "curio22",
    aliases: ["cmd_curio22","alt_curio22","atalho_curio22","abrev_curio22","call_curio22","func_curio22"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Fronteiras que contam uma história",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["chinarussia — abre a ficha de china e rússia","comparar chinarussia, brasil — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio22" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
