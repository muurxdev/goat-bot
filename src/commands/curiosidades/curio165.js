/**
 * .curio165 — A independência dos Estados Unidos
 *
 * A independência dos Estados Unidos: 6 fichas consultáveis (A briga do imposto, A Declaração de Independência, A guerra de independência, A Constituição, A Carta de Direitos, George Washington).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "independenciaeua"

module.exports = {
    name: "curio165",
    aliases: ["cmd_curio165","alt_curio165","atalho_curio165","abrev_curio165","call_curio165","func_curio165"],
    category: "curiosidades",
    subcategory: "História",
    description: "A independência dos Estados Unidos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["impostos — abre a ficha de a briga do imposto","comparar impostos, declaracao — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio165" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
