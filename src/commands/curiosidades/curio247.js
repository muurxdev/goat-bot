/**
 * .curio247 — Modalidades olímpicas pouco conhecidas
 *
 * Modalidades olímpicas pouco conhecidas: 6 fichas consultáveis (Pentatlo moderno, Curling, Keirin, Skeleton, Biatlo, Marcha atlética).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "modalidades"

module.exports = {
    name: "curio247",
    aliases: ["cmd_curio247","alt_curio247","atalho_curio247","abrev_curio247","call_curio247","func_curio247"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Modalidades olímpicas pouco conhecidas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["pentatlomoderno — abre a ficha de pentatlo moderno","comparar pentatlomoderno, curling — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio247" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
