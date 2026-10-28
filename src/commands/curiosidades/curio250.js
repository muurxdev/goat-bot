/**
 * .curio250 — O xadrez e seus campeões
 *
 * O xadrez e seus campeões: 6 fichas consultáveis (Wilhelm Steinitz, José Raúl Capablanca, Alexander Alekhine, Bobby Fischer, Garry Kasparov, Magnus Carlsen).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "xadrez"

module.exports = {
    name: "curio250",
    aliases: ["cmd_curio250","alt_curio250","atalho_curio250","abrev_curio250","call_curio250","func_curio250"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "O xadrez e seus campeões",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["steinitz — abre a ficha de wilhelm steinitz","comparar steinitz, capablanca — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio250" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
