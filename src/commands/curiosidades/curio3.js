/**
 * .curio3 — Os rios mais longos do mundo
 *
 * Os rios mais longos do mundo: 6 fichas consultáveis (Nilo, Amazonas, Yangtzé, Mississippi-Missouri, Ienissei, Rio Amarelo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "rios"

module.exports = {
    name: "curio3",
    aliases: ["cmd_curio3","alt_curio3","atalho_curio3","abrev_curio3","call_curio3","func_curio3"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os rios mais longos do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["nilo — abre a ficha de nilo","comparar nilo, amazonas — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio3" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
