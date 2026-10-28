/**
 * .curio229 — A música eletrônica
 *
 * A música eletrônica: 6 fichas consultáveis (A música concreta, Kraftwerk, O house de Chicago, O techno de Detroit, O jungle e o drum and bass, Daft Punk).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "musicaeletronica"

module.exports = {
    name: "curio229",
    aliases: ["cmd_curio229","alt_curio229","atalho_curio229","abrev_curio229","call_curio229","func_curio229"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "A música eletrônica",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["concreta — abre a ficha de a música concreta","comparar concreta, kraftwerk — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio229" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
