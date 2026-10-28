/**
 * .curio16 — A linha internacional da data
 *
 * A linha internacional da data: 6 fichas consultáveis (Samoa, Kiribati, Alasca, Ilhas Diomedes, Antártida, A linha em si).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "linhadata"

module.exports = {
    name: "curio16",
    aliases: ["cmd_curio16","alt_curio16","atalho_curio16","abrev_curio16","call_curio16","func_curio16"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "A linha internacional da data",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["samoa — abre a ficha de samoa","comparar samoa, kiribati1995 — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio16" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
