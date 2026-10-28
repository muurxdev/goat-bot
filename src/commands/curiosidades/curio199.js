/**
 * .curio199 — Sapos, rãs, pererecas e salamandras
 *
 * Sapos, rãs, pererecas e salamandras: 6 fichas consultáveis (Sapo-cururu, Rã-flecha-dourada, Perereca-de-banheiro, Salamandra-gigante-da-china, Axolote, Cecília).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "anfibios"

module.exports = {
    name: "curio199",
    aliases: ["cmd_curio199","alt_curio199","atalho_curio199","abrev_curio199","call_curio199","func_curio199"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Sapos, rãs, pererecas e salamandras",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["cururu — abre a ficha de sapo-cururu","comparar cururu, raflecha — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio199" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
