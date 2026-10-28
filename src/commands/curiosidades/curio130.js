/**
 * .curio130 — Os plásticos e quanto tempo ficam por aí
 *
 * Os plásticos e quanto tempo ficam por aí: 6 fichas consultáveis (PET, PEAD, PVC, PEBD, PP, PS e isopor).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "plasticos"

module.exports = {
    name: "curio130",
    aliases: ["cmd_curio130","alt_curio130","atalho_curio130","abrev_curio130","call_curio130","func_curio130"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Os plásticos e quanto tempo ficam por aí",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["pet — abre a ficha de pet","comparar pet, pead — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio130" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
