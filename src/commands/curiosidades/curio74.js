/**
 * .curio74 — Danças tradicionais do Brasil
 *
 * Danças tradicionais do Brasil: 6 fichas consultáveis (Carimbó, Ciranda, Coco de roda, Jongo, Catira, Congada).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "dancas"

module.exports = {
    name: "curio74",
    aliases: ["cmd_curio74","alt_curio74","atalho_curio74","abrev_curio74","call_curio74","func_curio74"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Danças tradicionais do Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["carimbo — abre a ficha de carimbó","comparar carimbo, ciranda — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio74" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
