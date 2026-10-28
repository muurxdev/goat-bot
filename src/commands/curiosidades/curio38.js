/**
 * .curio38 — As grandes florestas do planeta
 *
 * As grandes florestas do planeta: 6 fichas consultáveis (Floresta boreal, ou taiga, Amazônia, Bacia do Congo, Floresta de Daintree, Floresta Valdiviana, Floresta Nacional de Tongass).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "florestas"

module.exports = {
    name: "curio38",
    aliases: ["cmd_curio38","alt_curio38","atalho_curio38","abrev_curio38","call_curio38","func_curio38"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "As grandes florestas do planeta",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["taiga — abre a ficha de floresta boreal, ou taiga","comparar taiga, amazonia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio38" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
