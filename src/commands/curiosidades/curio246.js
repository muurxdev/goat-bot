/**
 * .curio246 — Os Jogos Olímpicos
 *
 * Os Jogos Olímpicos: 6 fichas consultáveis (Atenas, Berlim, Cidade do México, Munique, Rio de Janeiro, Tóquio).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "olimpiadas"

module.exports = {
    name: "curio246",
    aliases: ["cmd_curio246","alt_curio246","atalho_curio246","abrev_curio246","call_curio246","func_curio246"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Os Jogos Olímpicos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["atenas1896 — abre a ficha de atenas","comparar atenas1896, berlim1936 — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio246" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
