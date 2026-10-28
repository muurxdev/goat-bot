/**
 * .curio141 — A Mesopotâmia, onde a escrita nasceu
 *
 * A Mesopotâmia, onde a escrita nasceu: 6 fichas consultáveis (Uruk, Ur, Acádia de Sargão, Babilônia de Hamurábi, Nínive assíria, A contagem de base sessenta).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "mesopotamia"

module.exports = {
    name: "curio141",
    aliases: ["cmd_curio141","alt_curio141","atalho_curio141","abrev_curio141","call_curio141","func_curio141"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Mesopotâmia, onde a escrita nasceu",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["uruk — abre a ficha de uruk","comparar uruk, ur — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio141" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
