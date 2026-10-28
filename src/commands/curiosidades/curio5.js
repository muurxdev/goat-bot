/**
 * .curio5 — Vulcões que mudaram a história
 *
 * Vulcões que mudaram a história: 6 fichas consultáveis (Vesúvio, Tambora, Krakatoa, Etna, Eyjafjallajökull, Kilauea).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "vulcoes"

module.exports = {
    name: "curio5",
    aliases: ["cmd_curio5","alt_curio5","atalho_curio5","abrev_curio5","call_curio5","func_curio5"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Vulcões que mudaram a história",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["vesuvio — abre a ficha de vesúvio","comparar vesuvio, tambora — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio5" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
