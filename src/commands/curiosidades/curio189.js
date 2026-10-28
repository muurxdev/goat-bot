/**
 * .curio189 — Os tubarões, ficha a ficha
 *
 * Os tubarões, ficha a ficha: 6 fichas consultáveis (Tubarão-branco, Tubarão-baleia, Tubarão-martelo-recortado, Tubarão-da-groenlândia, Tubarão-cabeça-chata, Tubarão-mako).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "tubaroes"

module.exports = {
    name: "curio189",
    aliases: ["cmd_curio189","alt_curio189","atalho_curio189","abrev_curio189","call_curio189","func_curio189"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os tubarões, ficha a ficha",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["branco — abre a ficha de tubarão-branco","comparar branco, baleia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio189" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
