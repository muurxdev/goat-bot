/**
 * .curio167 — A era napoleônica
 *
 * A era napoleônica: 6 fichas consultáveis (A tomada do poder, O Código Civil, Austerlitz, O Bloqueio Continental, A campanha da Rússia, Waterloo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "napoleao"

module.exports = {
    name: "curio167",
    aliases: ["cmd_curio167","alt_curio167","atalho_curio167","abrev_curio167","call_curio167","func_curio167"],
    category: "curiosidades",
    subcategory: "História",
    description: "A era napoleônica",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["tomadadopoder — abre a ficha de a tomada do poder","comparar tomadadopoder, codigocivil — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio167" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
