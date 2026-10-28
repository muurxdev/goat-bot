/**
 * .curio50 — Os países mais novos do mundo
 *
 * Os países mais novos do mundo: 6 fichas consultáveis (Sudão do Sul, Montenegro, Timor-Leste, Palau, Eritreia, Chéquia e Eslováquia).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "paisesnovos"

module.exports = {
    name: "curio50",
    aliases: ["cmd_curio50","alt_curio50","atalho_curio50","abrev_curio50","call_curio50","func_curio50"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os países mais novos do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["sudaodosul — abre a ficha de sudão do sul","comparar sudaodosul, montenegro — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio50" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
