/**
 * .curio248 — As Copas do Mundo
 *
 * As Copas do Mundo: 6 fichas consultáveis (A primeira Copa, A Copa do quadrangular final, A Copa da estreia de um garoto, A Copa do cachorro Pickles, A Copa dos dois gols de Maradona, A Copa do fim do ano).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "copas"

module.exports = {
    name: "curio248",
    aliases: ["cmd_curio248","alt_curio248","atalho_curio248","abrev_curio248","call_curio248","func_curio248"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "As Copas do Mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["copa1930 — abre a ficha de a primeira copa","comparar copa1930, copa1950 — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio248" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
