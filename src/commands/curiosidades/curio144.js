/**
 * .curio144 — Roma, da aldeia de pastores à república
 *
 * Roma, da aldeia de pastores à república: 6 fichas consultáveis (Os cônsules, O senado, Os tribunos da plebe, O ditador, Os censores, Os irmãos Graco).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "romarepublica"

module.exports = {
    name: "curio144",
    aliases: ["cmd_curio144","alt_curio144","atalho_curio144","abrev_curio144","call_curio144","func_curio144"],
    category: "curiosidades",
    subcategory: "História",
    description: "Roma, da aldeia de pastores à república",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["consulado — abre a ficha de os cônsules","comparar consulado, senado — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio144" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
