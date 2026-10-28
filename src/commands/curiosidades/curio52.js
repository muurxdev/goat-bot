/**
 * .curio52 — Ferrovias que atravessam continentes
 *
 * Ferrovias que atravessam continentes: 6 fichas consultáveis (Transiberiana, Ferrovia Qinghai-Tibete, Shinkansen, Orient Express, Eurostar, Trem das Nuvens).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "ferrovias"

module.exports = {
    name: "curio52",
    aliases: ["cmd_curio52","alt_curio52","atalho_curio52","abrev_curio52","call_curio52","func_curio52"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Ferrovias que atravessam continentes",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["transiberiana — abre a ficha de transiberiana","comparar transiberiana, qinghai — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio52" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
