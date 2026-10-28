/**
 * .curio6 — As maiores ilhas do mundo
 *
 * As maiores ilhas do mundo: 6 fichas consultáveis (Groenlândia, Nova Guiné, Bornéu, Madagascar, Ilha de Baffin, Sumatra).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "ilhas"

module.exports = {
    name: "curio6",
    aliases: ["cmd_curio6","alt_curio6","atalho_curio6","abrev_curio6","call_curio6","func_curio6"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "As maiores ilhas do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["groenlandia — abre a ficha de groenlândia","comparar groenlandia, novaguine — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio6" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
