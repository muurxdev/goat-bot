/**
 * .curio176 — As grandes pandemias da história
 *
 * As grandes pandemias da história: 6 fichas consultáveis (A peste de Justiniano, A peste negra, A varíola nas Américas, A gripe de 1918, A cólera em Londres, O HIV e a aids).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "pandemias"

module.exports = {
    name: "curio176",
    aliases: ["cmd_curio176","alt_curio176","atalho_curio176","abrev_curio176","call_curio176","func_curio176"],
    category: "curiosidades",
    subcategory: "História",
    description: "As grandes pandemias da história",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["justiniano — abre a ficha de a peste de justiniano","comparar justiniano, pestenegra — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio176" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
