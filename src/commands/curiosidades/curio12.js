/**
 * .curio12 — Bandeiras da América, explicadas
 *
 * Bandeiras da América, explicadas: 6 fichas consultáveis (Brasil, Argentina, Canadá, Estados Unidos, México, Jamaica).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "bandeirasamerica"

module.exports = {
    name: "curio12",
    aliases: ["cmd_curio12","alt_curio12","atalho_curio12","abrev_curio12","call_curio12","func_curio12"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Bandeiras da América, explicadas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["brasil — abre a ficha de brasil","comparar brasil, argentina — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio12" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
