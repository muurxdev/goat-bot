/**
 * .curio159 — A Peste Negra e o mundo que ela mudou
 *
 * A Peste Negra e o mundo que ela mudou: 6 fichas consultáveis (O cerco de Caffa, A chegada a Messina, Florença, A quarentena, A falta de trabalhador, O médico da peste).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "pestenegra"

module.exports = {
    name: "curio159",
    aliases: ["cmd_curio159","alt_curio159","atalho_curio159","abrev_curio159","call_curio159","func_curio159"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Peste Negra e o mundo que ela mudou",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["caffa — abre a ficha de o cerco de caffa","comparar caffa, messina — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio159" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
