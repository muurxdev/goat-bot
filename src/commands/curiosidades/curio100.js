/**
 * .curio100 — As maiores cidades do Brasil
 *
 * As maiores cidades do Brasil: 6 fichas consultáveis (São Paulo, Rio de Janeiro, Brasília, Fortaleza, Salvador, Manaus).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cidadesbr"

module.exports = {
    name: "curio100",
    aliases: ["cmd_curio100","alt_curio100","atalho_curio100","abrev_curio100","call_curio100","func_curio100"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "As maiores cidades do Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["saopaulo — abre a ficha de são paulo","comparar saopaulo, rio — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio100" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
