/**
 * .curio25 — As maiores cidades do mundo
 *
 * As maiores cidades do mundo: 6 fichas consultáveis (Tóquio, Délhi, Xangai, São Paulo, Cidade do México, Cairo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cidadesgrandes"

module.exports = {
    name: "curio25",
    aliases: ["cmd_curio25","alt_curio25","atalho_curio25","abrev_curio25","call_curio25","func_curio25"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "As maiores cidades do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["toquio — abre a ficha de tóquio","comparar toquio, delhi — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio25" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
