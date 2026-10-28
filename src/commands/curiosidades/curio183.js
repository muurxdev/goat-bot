/**
 * .curio183 — Os animais que vivem mais
 *
 * Os animais que vivem mais: 6 fichas consultáveis (Tubarão-da-groenlândia, Quahog-do-oceano, Baleia-da-groenlândia, Tartaruga-gigante-de-aldabra, Tuatara, Peixe-rocha-de-olho-áspero).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "maislongevos"

module.exports = {
    name: "curio183",
    aliases: ["cmd_curio183","alt_curio183","atalho_curio183","abrev_curio183","call_curio183","func_curio183"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os animais que vivem mais",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["tubaraogelo — abre a ficha de tubarão-da-groenlândia","comparar tubaraogelo, quahog — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio183" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
