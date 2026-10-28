/**
 * .curio105 — Nebulosas, onde nascem e morrem estrelas
 *
 * Nebulosas, onde nascem e morrem estrelas: 6 fichas consultáveis (Nebulosa de Órion, Nebulosa do Caranguejo, Nebulosa da Águia, Nebulosa do Anel, Nebulosa Cabeça de Cavalo, Nebulosa de Carina).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "nebulosas"

module.exports = {
    name: "curio105",
    aliases: ["cmd_curio105","alt_curio105","atalho_curio105","abrev_curio105","call_curio105","func_curio105"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Nebulosas, onde nascem e morrem estrelas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["orion — abre a ficha de nebulosa de órion","comparar orion, caranguejo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio105" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
