/**
 * .curio216 — O Oscar e seus recordes
 *
 * O Oscar e seus recordes: 6 fichas consultáveis (A primeira cerimônia, O empate em onze, Katharine Hepburn, Walt Disney, Parasita, O envelope trocado).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "oscar"

module.exports = {
    name: "curio216",
    aliases: ["cmd_curio216","alt_curio216","atalho_curio216","abrev_curio216","call_curio216","func_curio216"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "O Oscar e seus recordes",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["primeira — abre a ficha de a primeira cerimônia","comparar primeira, onze — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio216" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
